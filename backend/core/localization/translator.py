import json
from pathlib import Path

LANG_DIR = Path(__file__).parent / "languages"


class Translator:
    def __init__(self, locale: str = "en"):
        self.locale = locale
        self.translations = {
            path.stem: json.loads(path.read_text(encoding="utf-8"))
            for path in LANG_DIR.glob("*.json")
        }

    def get(self, key: str, locale: str | None = None) -> str:
        value = self.translations.get(locale or self.locale, {})

        for part in key.split("."):
            if not isinstance(value, dict) or part not in value:
                return key

            value = value[part]

        return value if isinstance(value, str) else key


translator = Translator()
