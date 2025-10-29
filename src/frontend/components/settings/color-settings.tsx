"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react";

const themes = [
  { name: "slate", label: "Slate", color: "hsl(220 15% 15%)" },
  { name: "blue", label: "Biru", color: "hsl(207 76% 70%)" },
  { name: "green", label: "Hijau", color: "hsl(140 60% 65%)" },
  { name: "orange", label: "Oranye", color: "hsl(35 80% 70%)" },
];

export function ColorSettings() {
  const { setTheme, theme } = useTheme();
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
    <div className="space-y-4">
      <Label>Warna Aksen</Label>
      <div className="flex items-center gap-2">
        {themes.map((t) => (
          <Button
            key={t.name}
            variant={"outline"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => handleColorChange(t.name)}
          >
            <span
              className="flex h-5 w-5 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            {colorTheme === t.name && <Check className="h-4 w-4 absolute text-white" />}
            <span className="sr-only">{t.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

    
