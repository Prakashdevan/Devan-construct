import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem('lang') || 'en');
        };
        window.addEventListener('languageChange', handleLangChange);
        return () => window.removeEventListener('languageChange', handleLangChange);
    }, []);

    const t = (path) => {
        const keys = path.split('.');
        let result = translations[lang];
        for (const key of keys) {
            if (result[key]) {
                result = result[key];
            } else {
                return path; // Fallback to path if not found
            }
        }
        return result;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
