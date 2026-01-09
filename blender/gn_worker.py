import bpy
import sys
import json
import struct
import argparse

MAGIC = 0x4D455348  # 'MESH'
VERSION = 1


def _parse_args(argv):
    p = argparse.ArgumentParser(add_help=False)
    p.add_argument("--mode", required=True, choices=["schema", "mesh"])
    p.add_argument("--object", default="")
    p.add_argument("--values", default="")
    return p.parse_args(argv)


def _find_target_object(name_hint: str):
    if name_hint:
        ob = bpy.data.objects.get(name_hint)
        if ob is None:
            raise RuntimeError(f"Object '{name_hint}' not found")
        return ob

    for ob in bpy.data.objects:
        if ob.type != 'MESH':
            continue
        for m in ob.modifiers:
            if m.type == 'NODES' and m.node_group is not None:
                return ob
    raise RuntimeError("No mesh object with a Geometry Nodes modifier found")


def _find_gn_modifier(obj):
    for m in obj.modifiers:
        if m.type == 'NODES' and m.node_group is not None:
            return m
    raise RuntimeError(f"Object '{obj.name}' has no Geometry Nodes modifier")


def _bl_idprop_to_schema(name, prop):
    t = type(prop)
    if t is float:
        return {"name": name, "type": "float"}
    if t is int:
        return {"name": name, "type": "int"}
    if t is str:
        return {"name": name, "type": "string"}
    if t is bool:
        return {"name": name, "type": "bool"}
    try:
        if hasattr(prop, "__len__") and not isinstance(prop, (str, bytes)):
            ln = len(prop)
            return {"name": name, "type": "float_array", "length": ln}
    except Exception:
        pass
    return {"name": name, "type": "unknown"}


def _schema_for_modifier(mod):
    schema = []
    node_group = mod.node_group
    if node_group is None:
        return {"type": "schema", "object": mod.id_data.name, "modifier": mod.name, "params": []}
    
    name_mapping = {}
    try:
        if hasattr(node_group, 'interface') and hasattr(node_group.interface, 'items_tree'):
            for item in node_group.interface.items_tree:
                if hasattr(item, 'identifier') and hasattr(item, 'name'):
                    name_mapping[item.identifier] = item.name
        elif hasattr(node_group, 'inputs'):
            for inp in node_group.inputs:
                if hasattr(inp, 'identifier') and hasattr(inp, 'name'):
                    name_mapping[inp.identifier] = inp.name
    except Exception as e:
        print(f"[WARNING] Could not extract parameter names: {e}", file=sys.stderr)

    for k in mod.keys():
        if k in {'_RNA_UI'}:
            continue
        if k.endswith('_use_attribute') or k.endswith('_attribute_name'):
            continue
            
        v = mod.get(k)
        item = _bl_idprop_to_schema(k, v)
        item['display_name'] = name_mapping.get(k, k)
        item['identifier'] = k

        ui = None
        try:
            rna_ui = mod.get('_RNA_UI')
            if isinstance(rna_ui, dict) and k in rna_ui:
                ui = rna_ui[k]
        except Exception:
            ui = None
        
        if ui:
            for key in ("min", "max", "soft_min", "soft_max", "description"):
                if key in ui:
                    item[key] = ui[key]

        schema.append(item)

    return {"type": "schema", "object": mod.id_data.name, "modifier": mod.name, "params": schema}


def _apply_values(mod, values: dict):
    print(f"[DEBUG] Received values to apply: {values}", file=sys.stderr)
    print(f"[DEBUG] Available modifier keys: {list(mod.keys())}", file=sys.stderr)
    
    applied_count = 0
    for k, v in values.items():
        if k not in mod.keys():
            print(f"[DEBUG] Key '{k}' not found in modifier, skipping", file=sys.stderr)
            continue
            
        cur = mod.get(k)
        old_value = cur
        try:
            if isinstance(cur, float):
                mod[k] = float(v)
                print(f"[DEBUG] Applied '{k}': {old_value} -> {float(v)}", file=sys.stderr)
            elif isinstance(cur, int):
                mod[k] = int(v)
                print(f"[DEBUG] Applied '{k}': {old_value} -> {int(v)}", file=sys.stderr)
            elif isinstance(cur, str):
                mod[k] = str(v)
                print(f"[DEBUG] Applied '{k}': {old_value} -> {v}", file=sys.stderr)
            elif isinstance(cur, bool):
                mod[k] = bool(v)
                print(f"[DEBUG] Applied '{k}': {old_value} -> {v}", file=sys.stderr)
            else:
                if hasattr(cur, "__len__"):
                    arr = list(v)
                    ln = len(cur)
                    if len(arr) != ln:
                        arr = (arr + [0.0] * ln)[:ln]
                    mod[k] = arr
                    print(f"[DEBUG] Applied '{k}': {old_value} -> {arr}", file=sys.stderr)
            
            applied_count += 1
        except Exception as e:
            print(f"[DEBUG] Failed to apply '{k}': {e}", file=sys.stderr)
    
    print(f"[DEBUG] Successfully applied {applied_count}/{len(values)} values", file=sys.stderr)


def _mesh_to_binary(eval_obj):
    mesh = eval_obj.to_mesh(preserve_all_data_layers=True, depsgraph=bpy.context.evaluated_depsgraph_get())
    try:
        mesh.calc_loop_triangles()
        verts = mesh.vertices
        loop_tris = mesh.loop_triangles

        vcount = len(verts)
        positions = bytearray(vcount * 3 * 4)
        normals = bytearray(vcount * 3 * 4)

        for i, v in enumerate(verts):
            struct.pack_into('<3f', positions, i * 12, v.co.x, v.co.y, v.co.z)
            n = v.normal
            struct.pack_into('<3f', normals, i * 12, n.x, n.y, n.z)

        icount = len(loop_tris) * 3
        indices = bytearray(icount * 4)
        idx = 0
        for tri in loop_tris:
            for vi in tri.vertices:
                struct.pack_into('<I', indices, idx * 4, int(vi))
                idx += 1

        header = struct.pack('<4I', MAGIC, VERSION, vcount, icount)
        return header + positions + normals + indices
    finally:
        eval_obj.to_mesh_clear()


def main():
    original_stdout = sys.stdout
    sys.stdout = sys.stderr
    
    argv = sys.argv
    if "--" not in argv:
        raise RuntimeError("Missing '--' arguments")
    idx = argv.index("--")
    args = _parse_args(argv[idx + 1:])

    obj = _find_target_object(args.object)
    mod = _find_gn_modifier(obj)

    sys.stdout = original_stdout

    if args.mode == 'schema':
        payload = json.dumps(_schema_for_modifier(mod)).encode('utf-8')
        sys.stdout.buffer.write(payload)
        sys.stdout.buffer.flush()
        return

    values = {}
    if args.values:
        values = json.loads(args.values)

    sys.stdout = sys.stderr
    _apply_values(mod, values)

    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    buf = _mesh_to_binary(eval_obj)
    
    sys.stdout = original_stdout
    sys.stdout.buffer.write(buf)
    sys.stdout.buffer.flush()


if __name__ == "__main__":
    main()
