"""Генерирует STL логотипа «Колледж метростроя»: плашка 3 мм + рельеф 2 мм."""
import re, sys
import xml.etree.ElementTree as ET
import numpy as np, trimesh
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely import affinity
from svgpathtools import parse_path

SVG = sys.argv[1] if len(sys.argv) > 1 else "logo.svg"
OUT = sys.argv[2] if len(sys.argv) > 2 else "logo.stl"
MOLD = "--mold" in sys.argv  # форма для заливки гипса (негатив)
MARK_ONLY = "--mark" in sys.argv or MOLD  # только знак «М», без надписи
sys.argv = [a for a in sys.argv if a not in ("--mark", "--mold")]
LOGO_W, MARGIN, BASE_H, RELIEF_H = (50.0 if MARK_ONLY else 90.0), (3.0 if MARK_ONLY else 5.0), 3.0, 2.0

def sub_polys(d):
    polys = []
    for sp in parse_path(d).continuous_subpaths():
        pts = []
        for seg in sp:
            n = 1 if seg.__class__.__name__ == "Line" else 24
            pts += [(seg.point(t).real, seg.point(t).imag) for t in np.linspace(0, 1, n, endpoint=False)]
        if len(pts) >= 3:
            p = Polygon(pts).buffer(0)
            if not p.is_empty: polys.append(p)
    return polys

shapes = []
for el in ET.parse(SVG).getroot().iter():
    tag = el.tag.split("}")[1]
    a = el.attrib
    if tag == "rect":
        x, y, w, h = (float(a.get(k, 0)) for k in "x y width height".split())
        shapes.append(box(x, y, x + w, y + h))
    elif tag == "polygon":
        v = [float(n) for n in re.findall(r"-?\d*\.?\d+", a["points"])]
        shapes.append(Polygon(list(zip(v[::2], v[1::2]))).buffer(0))
    elif tag == "path" and not MARK_ONLY:
        res = None
        for p in sub_polys(a["d"]):  # чётно-нечётное правило: дырки в «О», «А»
            res = p if res is None else res.symmetric_difference(p)
        shapes.append(res)

logo = unary_union(shapes)
minx, miny, maxx, maxy = logo.bounds
s = LOGO_W / (maxx - minx)
logo = affinity.scale(logo, s, -s, origin=(0, 0))  # SVG: ось Y вниз
minx, miny, maxx, maxy = logo.bounds
logo = affinity.translate(logo, -minx, -miny)
logo = logo.buffer(0.04, join_style=2)  # убирает касания в одной точке
w, h = maxx - minx, maxy - miny
base = box(-MARGIN, -MARGIN, w + MARGIN, h + MARGIN)

def extrude(poly, height, z):
    geoms = poly.geoms if hasattr(poly, "geoms") else [poly]
    ms = []
    for g in geoms:
        if g.geom_type == "Polygon" and g.area > 1e-6:
            m = trimesh.creation.extrude_polygon(g, height); m.apply_translation([0, 0, z]); ms.append(m)
    return trimesh.util.concatenate(ms)

if MOLD:
    # Заливка лицом вниз: рельеф — углубление в дне, поэтому знак зеркалим по X.
    FLOOR, WALL, POUR_H = 4.0, 3.0, 9.0  # дно, стенка, высота стенок над дном (мм)
    pocket = affinity.scale(logo, -1, 1, origin=(w / 2, 0))
    outer = box(-MARGIN - WALL, -MARGIN - WALL, w + MARGIN + WALL, h + MARGIN + WALL)
    mesh = trimesh.boolean.union([extrude(outer, FLOOR + POUR_H, 0)], engine="manifold", check_volume=False)
    cavity = extrude(base, POUR_H + 1, FLOOR)           # полость плашки
    mark = extrude(pocket, RELIEF_H + 0.01, FLOOR - RELIEF_H)  # углубление под рельеф
    mesh = trimesh.boolean.difference([mesh, cavity, mark], engine="manifold", check_volume=False)
    mesh.export(OUT)
    print("mold size mm", mesh.extents, "watertight", mesh.is_watertight)
    sys.exit()
mesh = trimesh.boolean.union([extrude(base, BASE_H, 0), extrude(logo, RELIEF_H, BASE_H - 0.01)], engine="manifold", check_volume=False)
mesh.merge_vertices()
mesh.export(OUT)
print("size mm", mesh.extents, "watertight", mesh.is_watertight, "faces", len(mesh.faces))

import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
fig = plt.figure(figsize=(10, 5)); ax = fig.add_subplot(projection="3d")
ax.plot_trisurf(mesh.vertices[:, 0], mesh.vertices[:, 1], mesh.vertices[:, 2], triangles=mesh.faces, color="#35b9cb", linewidth=0, shade=True)
ax.view_init(50, -75); ax.set_box_aspect(tuple(mesh.extents)); ax.axis("off")
fig.savefig(OUT.replace(".stl", "_preview.png"), dpi=150, bbox_inches="tight")
