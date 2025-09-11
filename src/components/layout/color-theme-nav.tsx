
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { Check, Palette } from 'lucide-react';
import React from 'react';

const themes = [
  { name: "slate", label: "Slate", color: "hsl(220 15% 15%)" },
  { name: "blue", label: "Biru", color: "hsl(207 76% 70%)" },
  { name: "green", label: "Hijau", color: "hsl(140 60% 65%)" },
  { name: "orange", label: "Oranye", color: "hsl(35 80% 70%)" },
];

export function ColorThemeNav() {
  const [colorTheme, setColorTheme] = React.useState('slate');
  
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme') || 'slate';
    const currentTheme = document.documentElement.getAttribute('data-theme') || savedTheme;
    setColorTheme(currentTheme);
  }, []);

  const handleColorChange = (newColor: string) => {
    document.documentElement.setAttribute('data-theme', newColor);
    setColorTheme(newColor);
    localStorage.setItem('color-theme', newColor);
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Ubah Warna</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium leading-none">Warna Aksen</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
            <DropdownMenuItem key={t.name} onSelect={() => handleColorChange(t.name)} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: t.color }}/>
                <span>{t.label}</span>
              </div>
              {colorTheme === t.name && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
