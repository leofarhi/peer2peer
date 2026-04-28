# --- VARIABLES ---
BACKEND_DIR = backend
FRONTEND_DIR = .

.PHONY: all install run rundb clean db-up db-down fclean

# Règle par défaut
all: run

# 1. Installe les dépendances
install:
	@echo "📦 Installation des dépendances Backend..."
	cd $(BACKEND_DIR) && npm install
	@echo "📦 Installation des dépendances Frontend..."
	cd $(FRONTEND_DIR) && npm install
	@echo "✅ Installation terminée !"

# 2. Lance la DB (Docker)
db-up:
	@echo "🐘 Lancement de PostgreSQL (Docker)..."
	docker-compose up -d

# 3. Arrête la DB
db-down:
	@echo "🛑 Arrêt de PostgreSQL..."
	docker-compose down

# 4. Lance Front + Back + DB
run: db-up
	@echo "🚀 Lancement de Fruitz 42 (Front + Back)..."
	@echo "🛑 Appuyez sur Ctrl+C pour arrêter les serveurs (La DB restera active)."
	@(trap 'kill 0' SIGINT; \
	cd $(BACKEND_DIR) && npx nodemon server.js & \
	cd $(FRONTEND_DIR) && npm run dev)

# 5. Lance Prisma Studio (assure-toi que la DB est up)
rundb: db-up
	@echo "🗄️  Ouverture de Prisma Studio..."
	cd $(BACKEND_DIR) && npx prisma studio

# 6. Nettoie les node_modules
clean:
	@echo "🧹 Nettoyage des fichiers temporaires..."
	rm -rf $(BACKEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/dist

# 7. Reset TOTAL (Supprime les containers Docker + Reset Prisma)
fclean: clean db-down
	@echo "🔥 Suppression des volumes Docker (Données perdues)..."
	docker-compose down -v
	@echo "♻️  Redémarrage propre..."
	docker-compose up -d
	@echo "⏳ Attente que la DB soit prête..."
	sleep 3
	@echo "🔄 Prisma Migrate Reset..."
	cd $(BACKEND_DIR) && npx prisma migrate reset --force
	@echo "🌱 Seeding..."
	node $(BACKEND_DIR)/debug/seed.js
	@echo "✨ Tout est neuf !"