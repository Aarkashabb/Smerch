
import React, { useState, useEffect, useMemo } from 'react';

interface ReportTemplate {
  id: string;
  name: string;
  content: string;
  defaults?: Record<string, string>;
}

const templatesData: ReportTemplate[] = [
  {
    id: 'smerch',
    name: 'Доповідь В.Г. "Смерч"',
    content: `В.Г. " Смерч"
з 20:00  {{Дата і час початку}}
до 8:00 {{Дата і час закінчення}}
1.Старший наряду 
{{ПІБ Старшого наряду}}
  1)Дозорний - 
{{ПІБ Дозорного}}
  2) Корегувальник - 
{{ПІБ Корегувальника}}
  3) Кулеметники -
{{ПІБ Кулеметника 1}}
{{ПІБ Кулеметника 2}}
{{ПІБ Кулеметника 3}}

2.Озброення
 1)Ак-74 - {{К-сть АК-74}}
 2)Кулемет ДПМ - {{К-сть ДПМ}}
 3) Кулемет ПКМ - {{К-сть ПКМ}}
 4)Набої 5,45*39 -  {{К-сть набоїв 5,45}}
 4)Набої 7,62*54 - {{К-сть набоїв 7,62}}

3.Обладнання
 1) Тепловізор - {{К-сть тепловізорів}}
 2) Прожектор - {{К-сть прожекторів}}
 3) Рація Baofeng -  {{К-сть рацій}}
 4) Лазерна указка -  {{К-сть указок}}
 5) Бронежилети - {{К-сть бронежилетів}}
 6) Шоломи - {{К-сть шоломів}} 

Вибув:
1) {{Вибув 1}}
2) {{Вибув 2}}
3) {{Вибув 3}}
4) {{Вибув 4}}
5) {{Вибув 5}}

Прибув:
1) {{Прибув 1}}
2) {{Прибув 2}}
3) {{Прибув 3}}
4) {{Прибув 4}}
5) {{Прибув 5}}

{{ПІБ відповідального}}
старший ВГ
{{Телефон відповідального}}

Відеозйомку веде 
{{ПІБ оператора}}`,
    defaults: {
        'ПІБ Старшого наряду': 'Савченко В.А.',
        'ПІБ Дозорного': 'Дідовець В.З.',
        'ПІБ Корегувальника': 'Савченко В.А.',
        'ПІБ Кулеметника 1': 'Краснощок Г.В.',
        'ПІБ Кулеметника 2': 'Кравченко І.М.',
        'ПІБ Кулеметника 3': 'Козак М.М',
        'Вибув 1': 'Ахмадулін О.П.',
        'Вибув 2': 'Морванюк Д.С.',
        'Вибув 3': 'Савченко В.А.',
        'Вибув 4': 'Шинін Є.В.',
        'Вибув 5': 'Лавров О.А',
        'Прибув 1': 'Дідовець В.З.',
        'Прибув 2': 'Савченко В.А.',
        'Прибув 3': 'Краснощок Г.В.',
        'Прибув 4': 'Кравченко І.М.',
        'Прибув 5': 'Козак М.М',
        'ПІБ відповідального': 'Савченко В.А.',
        'Телефон відповідального': '+380679592803',
        'ПІБ оператора': 'Савченко В.А.',
    }
  },
  {
    id: 'placeholder',
    name: 'Інший шаблон (Приклад)',
    content: `Шановний {{Ім'я}},

Дякуємо за ваше замовлення №{{Номер замовлення}}.
Очікувана дата доставки: {{Дата доставки}}.

З повагою,
Команда підтримки.`,
    defaults: {
      'Ім\'я': 'Клієнт',
      'Номер замовлення': '12345',
      'Дата доставки': '01.01.2025'
    }
  }
];

const SETTINGS_KEYS = [
    'К-сть АК-74', 'К-сть ДПМ', 'К-сть ПКМ', 'К-сть набоїв 5,45', 'К-сть набоїв 7,62',
    'К-сть тепловізорів', 'К-сть прожекторів', 'К-сть рацій', 'К-сть указок',
    'К-сть бронежилетів', 'К-сть шоломів'
];

const PERSONNEL_FIELDS = [
    'ПІБ Старшого наряду', 'ПІБ Дозорного', 'ПІБ Корегувальника', 'ПІБ Кулеметника 1',
    'ПІБ Кулеметника 2', 'ПІБ Кулеметника 3', 'ПІБ відповідального', 'ПІБ оператора',
    'Вибув 1', 'Вибув 2', 'Вибув 3', 'Вибув 4', 'Вибув 5',
    'Прибув 1', 'Прибув 2', 'Прибув 3', 'Прибув 4', 'Прибув 5'
];


interface SmerchSettings {
    shiftDayStart: string;
    shiftDayEnd: string;
    shiftNightStart: string;
    shiftNightEnd: string;
    squad1: string;
    squad2: string;
    [key: string]: string; // For equipment
}

const defaultSettings: SmerchSettings = {
    shiftDayStart: '08:00',
    shiftDayEnd: '20:00',
    shiftNightStart: '20:00',
    shiftNightEnd: '08:00',
    'К-сть АК-74': '3од.',
    'К-сть ДПМ': '1шт.',
    'К-сть ПКМ': '2 шт.',
    'К-сть набоїв 5,45': '1080 шт.',
    'К-сть набоїв 7,62': '2541 шт.',
    'К-сть тепловізорів': '1од.',
    'К-сть прожекторів': '2од.',
    'К-сть рацій': '2од.',
    'К-сть указок': '1од.',
    'К-сть бронежилетів': '5 шт.',
    'К-сть шоломів': '5 шт.',
    squad1: 'Савченко В.А.\nДідовець В.З.\nКраснощок Г.В.\nШинін Є.В.\nЛавров О.А',
    squad2: 'Кравченко І.М.\nКозак М.М.\nАхмадулін О.П.\nМорванюк Д.С.',
};

const SettingsModal = ({ settings, onSave, onClose }: { settings: SmerchSettings, onSave: (newSettings: SmerchSettings) => void, onClose: () => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleInputChange = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 w-full max-w-lg max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-semibold mb-4 text-teal-300 border-b border-slate-700 pb-2">Налаштування шаблону "Смерч"</h2>
                <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                    <h3 className="text-lg font-medium text-slate-300 mt-2">Час змін</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Денна (початок):</label>
                            <input type="time" value={localSettings.shiftDayStart} onChange={e => handleInputChange('shiftDayStart', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Денна (кінець):</label>
                            <input type="time" value={localSettings.shiftDayEnd} onChange={e => handleInputChange('shiftDayEnd', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Нічна (початок):</label>
                            <input type="time" value={localSettings.shiftNightStart} onChange={e => handleInputChange('shiftNightStart', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Нічна (кінець):</label>
                            <input type="time" value={localSettings.shiftNightEnd} onChange={e => handleInputChange('shiftNightEnd', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white"/>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mt-4">Склад відділень</h3>
                     <div>
                        <label htmlFor="squad1" className="block text-sm font-medium text-slate-300 mb-1">Відділення 1 (кожен з нового рядка):</label>
                        <textarea 
                            id="squad1"
                            rows={4}
                            value={localSettings.squad1}
                            onChange={(e) => handleInputChange('squad1', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                         />
                    </div>
                     <div>
                        <label htmlFor="squad2" className="block text-sm font-medium text-slate-300 mb-1">Відділення 2 (кожен з нового рядка):</label>
                        <textarea 
                            id="squad2"
                            rows={4}
                            value={localSettings.squad2}
                            onChange={(e) => handleInputChange('squad2', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                         />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mt-4">Обладнання та озброєння</h3>
                    {SETTINGS_KEYS.map(key => (
                        <div key={key}>
                            <label htmlFor={`settings-${key}`} className="block text-sm font-medium text-slate-300 mb-1">{key}:</label>
                            <input
                                type="text"
                                id={`settings-${key}`}
                                value={localSettings[key] || ''}
                                onChange={e => handleInputChange(key, e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    ))}
                </div>
                 <div className="mt-6 flex gap-4">
                    <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">Зберегти</button>
                    <button onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition">Закрити</button>
                </div>
            </div>
        </div>
    );
};

interface PersonnelInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    personnel: Record<string, string[]>;
}

const PersonnelInput: React.FC<PersonnelInputProps> = ({ label, value, onChange, personnel }) => {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
            onChange(selectedValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };
    
    const isManualEntry = value && !Object.values(personnel).flat().includes(value);
    const selectValue = isManualEntry ? '' : value;

    return (
        <div>
            <label htmlFor={label} className="block text-sm font-medium text-slate-300 mb-1">{label}:</label>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    id={label}
                    value={value || ''}
                    onChange={handleInputChange}
                    className="flex-grow w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Введіть або оберіть із списку"
                />
                <select
                    value={selectValue}
                    onChange={handleSelectChange}
                    className="sm:w-auto bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                    aria-label={`Вибір для ${label}`}
                >
                    <option value="">-- Зі списку --</option>
                     {Object.entries(personnel).map(([squadName, names]) => (
                        <optgroup label={squadName} key={squadName}>
                            {/* FIX: Add Array.isArray check to ensure `names` is an array before calling `.map` and to satisfy TypeScript. */}
                            {Array.isArray(names) && names.map(name => <option key={name} value={name}>{name}</option>)}
                        </optgroup>
                    ))}
                </select>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [templates, setTemplates] = useState(templatesData);
    const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [copyButtonText, setCopyButtonText] = useState('Копіювати звіт');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<SmerchSettings>(defaultSettings);
    const [selectedShift, setSelectedShift] = useState<'night' | 'day'>('night');

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('smerch-settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    setSettings({ ...defaultSettings, ...parsed });
                } else {
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
            setSettings(defaultSettings);
        }
    }, []);

    const handleSaveSettings = (newSettings: SmerchSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem('smerch-settings', JSON.stringify(newSettings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    };
    
    const selectedTemplate = useMemo(() => {
        return templates.find(t => t.id === selectedTemplateId)!;
    }, [templates, selectedTemplateId]);

    const variables = useMemo(() => {
        if (!selectedTemplate) return [];
        const regex = /{{\s*(.*?)\s*}}/g;
        const allVars = [...selectedTemplate.content.matchAll(regex)].map(m => m[1]);
        const uniqueVars = [...new Set(allVars)];
        if (selectedTemplate.id === 'smerch') {
            return uniqueVars.filter(v => !SETTINGS_KEYS.includes(v) && !v.startsWith('Дата і час'));
        }
        return uniqueVars;
    }, [selectedTemplate]);
    
    const personnel = useMemo(() => {
        if (selectedTemplateId !== 'smerch') return {};
        return {
            'Відділення 1': settings.squad1.split('\n').filter(Boolean),
            'Відділення 2': settings.squad2.split('\n').filter(Boolean),
        }
    }, [settings, selectedTemplateId]);

    useEffect(() => {
        const data: Record<string, string> = { };

        try {
            const savedData = localStorage.getItem(`template-data-${selectedTemplateId}`);
            if (savedData) {
                const parsedSavedData = JSON.parse(savedData);
                if (parsedSavedData && typeof parsedSavedData === 'object' && !Array.isArray(parsedSavedData)) {
                    Object.assign(data, parsedSavedData);
                }
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
        
        // Apply defaults first
        Object.assign(data, { ...(selectedTemplate.defaults || {}), ...data });


        if (selectedTemplate.id === 'smerch') {
            SETTINGS_KEYS.forEach(key => {
                data[key] = settings[key] || '';
            });
        }
        
        setFormData(data);

    }, [selectedTemplateId, selectedTemplate, settings]);

    // Effect for handling date/time based on shift for Smerch template
    useEffect(() => {
        if (selectedTemplate.id !== 'smerch') return;

        const getFormattedDate = (date: Date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}.${month}.${year}`;
        }

        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const startDate = now;
        const endDate = selectedShift === 'night' ? tomorrow : now;
        
        // Always use the original template content to avoid mutation issues
        const originalSmerchTemplate = templatesData.find(t => t.id === 'smerch');
        if (!originalSmerchTemplate) return;

        const contentWithTime = originalSmerchTemplate.content
            .replace(/з\s\d{1,2}:\d{2}/, `з ${selectedShift === 'night' ? settings.shiftNightStart : settings.shiftDayStart}`)
            .replace(/до\s\d{1,2}:\d{2}/, `до ${selectedShift === 'night' ? settings.shiftNightEnd : settings.shiftDayEnd}`);
        
        setTemplates(prev => prev.map(t => t.id === 'smerch' ? {...t, content: contentWithTime} : t));

        setFormData(prev => ({
            ...prev,
            'Дата і час початку': getFormattedDate(startDate),
            'Дата і час закінчення': getFormattedDate(endDate),
        }));

    }, [selectedTemplate.id, selectedShift, settings]);


    useEffect(() => {
        try {
            if (Object.keys(formData).length > 0) {
               localStorage.setItem(`template-data-${selectedTemplateId}`, JSON.stringify(formData));
            }
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [formData, selectedTemplateId]);

    const handleInputChange = (variable: string, value: string) => {
        setFormData(prev => ({ ...prev, [variable]: value }));
    };

    const generatedReport = useMemo(() => {
        if (!selectedTemplate) return '';
        let report = selectedTemplate.content;
        
        const allPossibleVars = [...new Set([...Object.keys(formData), ...variables])];

        for (const variable of allPossibleVars) {
            const value = formData[variable] || '';
            const regex = new RegExp(`{{\\s*${variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*}}`, 'g');
            report = report.replace(regex, value);
        }
        return report;
    }, [selectedTemplate, formData, variables]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedReport).then(() => {
            setCopyButtonText('Скопійовано!');
            setTimeout(() => setCopyButtonText('Копіювати звіт'), 2000);
        }).catch(err => {
            console.error('Failed to copy report: ', err);
            alert('Не вдалося скопіювати звіт.');
        });
    };

    return (
      <>
        {isSettingsOpen && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setIsSettingsOpen(false)} />}
        <div className="bg-slate-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 relative">
              <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                Генератор звітів за шаблоном
              </h1>
              <p className="text-center text-slate-400 mt-2">Оберіть шаблон, заповніть поля та скопіюйте готовий звіт.</p>
               {selectedTemplateId === 'smerch' && (
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="absolute top-0 right-0 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                        aria-label="Відкрити налаштування"
                    >
                       Налаштування
                    </button>
                )}
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 flex flex-col">
                <div className="mb-6">
                  <label htmlFor="template-select" className="block text-sm font-medium text-slate-300 mb-2">Оберіть шаблон:</label>
                  <select 
                    id="template-select"
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>

                {selectedTemplateId === 'smerch' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Оберіть зміну:</label>
                        <div className="flex gap-4">
                            <button onClick={() => setSelectedShift('night')} className={`flex-1 py-2 px-3 rounded-lg transition ${selectedShift === 'night' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                Нічна ({settings.shiftNightStart} - {settings.shiftNightEnd})
                            </button>
                             <button onClick={() => setSelectedShift('day')} className={`flex-1 py-2 px-3 rounded-lg transition ${selectedShift === 'day' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                Денна ({settings.shiftDayStart} - {settings.shiftDayEnd})
                            </button>
                        </div>
                    </div>
                )}


                <h2 className="text-2xl font-semibold mb-4 text-teal-300 border-b border-slate-700 pb-2">Змінні шаблону</h2>
                <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                   {variables.map(variable => {
                        if (selectedTemplateId === 'smerch' && PERSONNEL_FIELDS.includes(variable)) {
                            return (
                                <PersonnelInput
                                    key={variable}
                                    label={variable}
                                    value={formData[variable] || ''}
                                    onChange={value => handleInputChange(variable, value)}
                                    personnel={personnel}
                                />
                            );
                        }
                        return (
                            <div key={variable}>
                                <label htmlFor={variable} className="block text-sm font-medium text-slate-300 mb-1">{variable}:</label>
                                <input
                                    type="text"
                                    id={variable}
                                    value={formData[variable] || ''}
                                    onChange={e => handleInputChange(variable, e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>
                        );
                    })}
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 flex flex-col">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400 border-b border-slate-700 pb-2">Попередній перегляд</h2>
                <div className="flex-grow bg-slate-900 rounded-lg p-4 whitespace-pre-wrap text-slate-300 overflow-y-auto text-sm">
                  {generatedReport}
                </div>
                <button
                  onClick={handleCopy}
                  className="mt-6 w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400"
                >
                  {copyButtonText}
                </button>
              </div>
            </main>
          </div>
        </div>
      </>
    );
};

export default App;
