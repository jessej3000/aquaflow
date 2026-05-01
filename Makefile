.PHONY: up down build api ui

up:
	@trap 'kill 0' INT; \
	(cd apps/api && source ../../.venv/bin/activate && uvicorn app.main:app --reload --port 8000) & \
	(cd apps/ui && npm run dev) & \
	wait

down:
	@echo "Stopping API and UI..."
	@pkill -f "uvicorn app.main:app" || true
	@pkill -f "vite" || true
	@echo "Done."

build:
	@echo "Building UI..."
	cd apps/ui && npm run build
	@echo "Installing API dependencies..."
	cd apps/api && source ../../.venv/bin/activate && pip install -r requirements.txt
	@echo "Build complete."
