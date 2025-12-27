// Скрипт для проверки готовности к деплою на GitHub Pages
const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка готовности к деплою...\n');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Проверка homepage
if (!packageJson.homepage || packageJson.homepage.includes('YOUR_USERNAME')) {
  console.log('❌ ОШИБКА: Необходимо обновить homepage в package.json');
  console.log('   Замените YOUR_USERNAME на ваш GitHub username\n');
  console.log('   Пример: "homepage": "https://ivanov.github.io/bot_new_year"');
  process.exit(1);
}

// Проверка скриптов
if (!packageJson.scripts.deploy) {
  console.log('❌ ОШИБКА: Скрипт deploy не найден в package.json');
  process.exit(1);
}

// Проверка gh-pages
try {
  require.resolve('gh-pages');
} catch (e) {
  console.log('❌ ОШИБКА: gh-pages не установлен');
  console.log('   Выполните: npm install --save-dev gh-pages');
  process.exit(1);
}

console.log('✅ package.json настроен правильно');
console.log(`✅ Homepage: ${packageJson.homepage}`);
console.log('✅ gh-pages установлен');
console.log('✅ Скрипт deploy найден\n');
console.log('🚀 Готово к деплою! Выполните: npm run deploy\n');

