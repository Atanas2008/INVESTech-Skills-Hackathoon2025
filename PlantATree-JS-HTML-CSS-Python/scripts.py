# Python equivalent of package.json scripts
import os
import sys
import subprocess
from pathlib import Path

class Scripts:
    """Express.js-style npm scripts for Python"""
    
    @staticmethod
    def dev():
        """Start development server (like npm run dev)"""
        os.environ['FLASK_ENV'] = 'development'
        os.environ['FLASK_DEBUG'] = '1'
        subprocess.run([sys.executable, 'app.py'])
    
    @staticmethod
    def start():
        """Start production server (like npm start)"""
        os.environ['FLASK_ENV'] = 'production'
        subprocess.run([
            'gunicorn', 
            '--bind', '0.0.0.0:5000',
            '--workers', '4',
            '--timeout', '30',
            'app:application'
        ])
    
    @staticmethod
    def test():
        """Run tests (like npm test)"""
        subprocess.run([sys.executable, '-m', 'pytest', 'tests/', '-v'])
    
    @staticmethod
    def lint():
        """Run linting (like npm run lint)"""
        print("🔍 Running Python linting...")
        subprocess.run([sys.executable, '-m', 'flake8', '.'])
        subprocess.run([sys.executable, '-m', 'black', '--check', '.'])
    
    @staticmethod
    def format():
        """Format code (like npm run format)"""
        print("🎨 Formatting Python code...")
        subprocess.run([sys.executable, '-m', 'black', '.'])
        subprocess.run([sys.executable, '-m', 'isort', '.'])
    
    @staticmethod
    def install():
        """Install dependencies (like npm install)"""
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    
    @staticmethod
    def build():
        """Build for production (like npm run build)"""
        print("📦 Building for production...")
        # Collect static files, compile assets, etc.
        subprocess.run([sys.executable, 'build.py'])
    
    @staticmethod
    def db_init():
        """Initialize database"""
        print("🗄️ Initializing database...")
        subprocess.run([sys.executable, '-c', 'from app import init_db; init_db()'])
    
    @staticmethod
    def db_migrate():
        """Run database migrations"""
        print("🔄 Running database migrations...")
        # Add migration logic here
        pass
    
    @staticmethod
    def db_seed():
        """Seed database with sample data"""
        print("🌱 Seeding database...")
        subprocess.run([sys.executable, 'seed_database.py'])
    
    @staticmethod
    def clean():
        """Clean build artifacts"""
        print("🧹 Cleaning build artifacts...")
        import shutil
        dirs_to_clean = ['__pycache__', '.pytest_cache', 'dist', 'build']
        for dir_name in dirs_to_clean:
            for path in Path('.').rglob(dir_name):
                if path.is_dir():
                    shutil.rmtree(path)
                    print(f"Removed {path}")

def main():
    """Command line interface for scripts"""
    import argparse
    
    parser = argparse.ArgumentParser(description='PlantATree development scripts')
    parser.add_argument('command', choices=[
        'dev', 'start', 'test', 'lint', 'format', 
        'install', 'build', 'db:init', 'db:migrate', 
        'db:seed', 'clean'
    ], help='Command to run')
    
    args = parser.parse_args()
    
    # Map commands to methods
    command_map = {
        'dev': Scripts.dev,
        'start': Scripts.start,
        'test': Scripts.test,
        'lint': Scripts.lint,
        'format': Scripts.format,
        'install': Scripts.install,
        'build': Scripts.build,
        'db:init': Scripts.db_init,
        'db:migrate': Scripts.db_migrate,
        'db:seed': Scripts.db_seed,
        'clean': Scripts.clean
    }
    
    command_func = command_map.get(args.command)
    if command_func:
        command_func()
    else:
        print(f"Unknown command: {args.command}")

if __name__ == '__main__':
    main()