import builtins

from .translator import translator

builtins.__ = translator.get  # type: ignore
