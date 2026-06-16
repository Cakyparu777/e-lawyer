import json
import subprocess
from pathlib import Path

from app.core.config import settings

ROOT_DIR = Path(__file__).resolve().parents[3]
TOKEN_SCRIPT = ROOT_DIR / "scripts" / "agora_rtm_token.cjs"


class AgoraTokenService:
    def build_rtm_token(self, channel_name: str, user_id: str) -> str:
        if not settings.agora_app_id or not settings.agora_app_certificate:
            raise ValueError("Agora App ID эсвэл App Certificate тохируулагдаагүй байна")

        result = subprocess.run(
            [
                "node",
                str(TOKEN_SCRIPT),
                settings.agora_app_id,
                settings.agora_app_certificate,
                channel_name,
                user_id,
                str(settings.agora_rtm_token_expire_seconds),
            ],
            check=True,
            capture_output=True,
            text=True,
            cwd=str(ROOT_DIR),
        )
        payload = json.loads(result.stdout)
        token = payload.get("token")
        if not isinstance(token, str) or not token:
            raise ValueError("Agora RTM token үүссэнгүй")
        return token


agora_token_service = AgoraTokenService()
