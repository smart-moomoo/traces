"""Compatibility entry point: the reviewed manifest is the single layer source."""
from pathlib import Path
import runpy,sys
root=Path(__file__).resolve().parents[1]
sys.argv=[str(root/'scripts/prepare-scene.py'),str(root/'assets/scenes/Seattle/layers.json')]
runpy.run_path(sys.argv[0],run_name='__main__')
