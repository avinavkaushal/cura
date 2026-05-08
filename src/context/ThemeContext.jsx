import React, { createContext, useContext, useEffect, useState } from 'react';

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check localStorage on first load, default to 'light' if nothing is saved
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('cura-theme');
    return savedTheme ? savedTheme : 'light';
  });

  // Whenever the theme changes, update the HTML tag and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark'); // This triggers Tailwind's dark: prefix
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('cura-theme', theme);
  }, [theme]);

  // The function we will attach to our Sidebar button
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// A handy custom hook so we don't have to import useContext everywhere
export const useTheme = () => useContext(ThemeContext);