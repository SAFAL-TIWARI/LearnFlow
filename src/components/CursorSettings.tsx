import React from 'react';
import { useCursor } from '@/context/CursorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';

interface CursorSettingsProps {
  className?: string;
}

export function CursorSettings({ className }: CursorSettingsProps) {
  const { 
    cursorSize, 
    setCursorSize, 
    cursorEnabled, 
    setCursorEnabled,
    cursorColor,
    setCursorColor 
  } = useCursor();

  const handleSizeChange = (value: number[]) => {
    const sizeValue = value[0];
    if (sizeValue <= 35) {
      setCursorSize('small');
    } else if (sizeValue <= 70) {
      setCursorSize('medium');
    } else {
      setCursorSize('large');
    }
  };

  // Convert size to slider value
  const getSizeValue = () => {
    if (cursorSize === 'small') return 25;
    if (cursorSize === 'medium') return 50;
    if (cursorSize === 'large') return 85;
    return typeof cursorSize === 'number' ? cursorSize : 50;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cursor Settings</CardTitle>
        <CardDescription>
          Customize the smooth cursor animation for your browsing experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cursor-enabled" className="flex-1">
              Enable Smooth Cursor
            </Label>
            <Switch
              id="cursor-enabled"
              checked={cursorEnabled}
              onCheckedChange={setCursorEnabled}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cursor-size">Cursor Size</Label>
              <span className="text-sm text-muted-foreground">
                {cursorSize === 'small' 
                  ? 'Small' 
                  : cursorSize === 'medium' 
                    ? 'Medium' 
                    : 'Large'}
              </span>
            </div>
            <Slider
              id="cursor-size"
              disabled={!cursorEnabled}
              value={[getSizeValue()]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleSizeChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cursor-color">Cursor Color</Label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                id="cursor-color"
                value={cursorColor}
                onChange={(e) => setCursorColor(e.target.value)}
                disabled={!cursorEnabled}
                className="h-10 w-10 cursor-pointer rounded-md border"
              />
              <div className="flex flex-wrap gap-2">
                {['#000000', '#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6'].map(color => (
                  <Button
                    key={color}
                    type="button"
                    disabled={!cursorEnabled}
                    variant="outline"
                    className="h-6 w-6 rounded-full p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => setCursorColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}