import React, { useState } from 'react';
import { downloadGameData, uploadGameData } from '../../services/api';

const ExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Выберите файл');
      return;
    }

    setUploading(true);
    try {
      await uploadGameData(file);
      alert('Импорт завершён! Обновите страницу.');
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to import:', error);
      alert('Ошибка при импорте файла: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    downloadGameData();
  };

  return (
    <div className="excel-import">
      <h1 className="excel-import-title">💾 Управление данными</h1>

      <div className="excel-import-content">
        <div className="import-form">
          <h2>Экспорт данных</h2>
          <p>Скачайте текущие данные игры в JSON файл</p>
          <button
            onClick={handleDownload}
            className="upload-button"
          >
            📥 Скачать данные (JSON)
          </button>

          <h2 style={{ marginTop: '32px' }}>Импорт данных</h2>
          <p>Загрузите JSON файл с данными игры</p>
          
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="file-input"
              id="json-file-input"
            />
            <label htmlFor="json-file-input" className="file-input-label">
              {file ? file.name : 'Выберите JSON файл'}
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-button"
          >
            {uploading ? 'Загрузка...' : '📤 Загрузить данные'}
          </button>

          <div className="import-info">
            <h3>Формат данных:</h3>
            <p>JSON файл должен содержать следующие поля:</p>
            <ul>
              <li><strong>characters</strong> - массив персонажей</li>
              <li><strong>locations</strong> - массив локаций</li>
              <li><strong>mobs</strong> - массив мобов</li>
              <li><strong>items</strong> - массив предметов</li>
              <li><strong>character_items</strong> - связи персонажей и предметов</li>
              <li><strong>notes</strong> - записки</li>
              <li><strong>dice_rolls</strong> - история бросков кубиков</li>
            </ul>
            <p style={{ marginTop: '16px', color: '#ff8888' }}>
              ⚠️ Внимание: импорт заменит все текущие данные!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;

