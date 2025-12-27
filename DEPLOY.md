# Инструкция по деплою на GitHub Pages

## Шаг 1: Создайте репозиторий на GitHub

1. Перейдите на [GitHub](https://github.com) и создайте новый репозиторий
2. Назовите его, например, `bot_new_year` (или любое другое имя)
3. **НЕ** инициализируйте с README, .gitignore или лицензией (если у вас уже есть код)

## Шаг 2: Инициализируйте Git репозиторий (если еще не сделано)

```bash
cd D:\bot_new_year
git init
git add .
git commit -m "Initial commit"
```

## Шаг 3: Подключите к GitHub репозиторию

```bash
git remote add origin https://github.com/YOUR_USERNAME/bot_new_year.git
git branch -M main
git push -u origin main
```

**Замените `YOUR_USERNAME` на ваш GitHub username!**

## Шаг 4: Обновите homepage в package.json

Откройте `frontend/package.json` и замените строку:
```json
"homepage": "https://YOUR_USERNAME.github.io/bot_new_year"
```

На ваш репозиторий (замените `YOUR_USERNAME` на ваш GitHub username):
```json
"homepage": "https://YOUR_USERNAME.github.io/bot_new_year"
```

**Пример:** Если ваш username `ivanov`, то будет:
```json
"homepage": "https://ivanov.github.io/bot_new_year"
```

## Шаг 5: Включите GitHub Pages в настройках репозитория

1. Перейдите в ваш репозиторий на GitHub
2. Нажмите **Settings** (Настройки)
3. В левом меню найдите **Pages**
4. В разделе **Source** выберите:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Нажмите **Save**

## Шаг 6: Задеплойте приложение

```bash
cd frontend
npm run deploy
```

Эта команда:
- Соберет проект (`npm run build`)
- Создаст ветку `gh-pages` с собранными файлами
- Загрузит их на GitHub

## Шаг 7: Дождитесь публикации

GitHub Pages обычно публикует сайт в течение 1-2 минут. Ваш сайт будет доступен по адресу:
```
https://YOUR_USERNAME.github.io/bot_new_year
```

## Обновление сайта

После любых изменений в коде:

```bash
cd frontend
npm run deploy
```

## Важные замечания

1. **Публичные данные**: Все данные в `public/data.json` будут публично доступны
2. **localStorage**: Данные пользователей хранятся локально в браузере
3. **HTTPS**: GitHub Pages автоматически предоставляет HTTPS
4. **Кэш**: После деплоя может потребоваться очистить кэш браузера (Ctrl+Shift+R)

## Решение проблем

### Сайт не обновляется
- Подождите 2-3 минуты
- Очистите кэш браузера
- Проверьте, что ветка `gh-pages` создана в репозитории

### Ошибка при деплое
- Убедитесь, что вы авторизованы в GitHub через Git
- Проверьте, что репозиторий существует и доступен
- Убедитесь, что `homepage` в `package.json` указан правильно

### 404 ошибка на страницах
- Убедитесь, что используете правильный URL
- Проверьте настройки GitHub Pages (ветка `gh-pages`)

