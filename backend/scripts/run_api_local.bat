@echo off
cd /d C:\Users\Johnny\Desktop\smartdiet-codex-docs\smartdiet-codex-docs\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > uvicorn-live.out.log 2> uvicorn-live.err.log
