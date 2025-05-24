import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Clock, 
  Hash, 
  FileText, 
  Zap, 
  Copy, 
  Check,
  Percent,
  DollarSign,
  Ruler,
  Thermometer,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const QuickTools = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  // Calculator states
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  // Unit converter states
  const [lengthValue, setLengthValue] = useState('');
  const [lengthFrom, setLengthFrom] = useState('meters');
  const [lengthTo, setLengthTo] = useState('feet');
  const [lengthResult, setLengthResult] = useState('');

  // Temperature converter states
  const [tempValue, setTempValue] = useState('');
  const [tempFrom, setTempFrom] = useState('celsius');
  const [tempTo, setTempTo] = useState('fahrenheit');
  const [tempResult, setTempResult] = useState('');

  // Percentage calculator states
  const [percentValue, setPercentValue] = useState('');
  const [percentOf, setPercentOf] = useState('');
  const [percentResult, setPercentResult] = useState('');

  // Word counter states
  const [textInput, setTextInput] = useState('');

  // Random generator states
  const [randomMin, setRandomMin] = useState('1');
  const [randomMax, setRandomMax] = useState('100');
  const [randomResult, setRandomResult] = useState('');

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const calculateExpression = () => {
    try {
      // Basic safety check - only allow numbers, operators, parentheses, and decimal points
      if (!/^[0-9+\-*/().\s]+$/.test(calcInput)) {
        setCalcResult('Invalid expression');
        return;
      }
      
      const result = Function('"use strict"; return (' + calcInput + ')')();
      setCalcResult(result.toString());
    } catch (error) {
      setCalcResult('Error');
    }
  };

  const convertLength = () => {
    const value = parseFloat(lengthValue);
    if (isNaN(value)) return;

    const conversions: { [key: string]: number } = {
      meters: 1,
      feet: 3.28084,
      inches: 39.3701,
      centimeters: 100,
      kilometers: 0.001,
      miles: 0.000621371,
      yards: 1.09361
    };

    const meters = value / conversions[lengthFrom];
    const result = meters * conversions[lengthTo];
    setLengthResult(result.toFixed(4));
  };

  const convertTemperature = () => {
    const value = parseFloat(tempValue);
    if (isNaN(value)) return;

    let celsius: number;
    
    // Convert to Celsius first
    switch (tempFrom) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        return;
    }

    // Convert from Celsius to target
    let result: number;
    switch (tempTo) {
      case 'celsius':
        result = celsius;
        break;
      case 'fahrenheit':
        result = celsius * 9/5 + 32;
        break;
      case 'kelvin':
        result = celsius + 273.15;
        break;
      default:
        return;
    }

    setTempResult(result.toFixed(2));
  };

  const calculatePercentage = () => {
    const value = parseFloat(percentValue);
    const of = parseFloat(percentOf);
    
    if (isNaN(value) || isNaN(of)) return;
    
    const result = (value / 100) * of;
    setPercentResult(result.toString());
  };

  const generateRandomNumber = () => {
    const min = parseInt(randomMin);
    const max = parseInt(randomMax);
    
    if (isNaN(min) || isNaN(max) || min >= max) return;
    
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomResult(result.toString());
  };

  const getWordCount = () => {
    const words = textInput.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = textInput.length;
    const charactersNoSpaces = textInput.replace(/\s/g, '').length;
    const lines = textInput.split('\n').length;
    
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      lines
    };
  };

  const wordStats = getWordCount();

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Quick Tools</h1>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="converters">Converters</TabsTrigger>
          <TabsTrigger value="percentage">Percentage</TabsTrigger>
          <TabsTrigger value="text">Text Tools</TabsTrigger>
          <TabsTrigger value="random">Random</TabsTrigger>
          <TabsTrigger value="more">More</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Basic Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="calc-input">Expression</Label>
                <Input
                  id="calc-input"
                  placeholder="e.g., 2 + 3 * 4"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && calculateExpression()}
                />
              </div>
              
              <Button onClick={calculateExpression} className="w-full">
                Calculate
              </Button>
              
              {calcResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Result: {calcResult}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(calcResult, 'calc')}
                    >
                      {copied === 'calc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="converters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Length Converter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Length Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="length-value">Value</Label>
                  <Input
                    id="length-value"
                    type="number"
                    placeholder="Enter value"
                    value={lengthValue}
                    onChange={(e) => setLengthValue(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>From</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={lengthFrom}
                      onChange={(e) => setLengthFrom(e.target.value)}
                    >
                      <option value="meters">Meters</option>
                      <option value="feet">Feet</option>
                      <option value="inches">Inches</option>
                      <option value="centimeters">Centimeters</option>
                      <option value="kilometers">Kilometers</option>
                      <option value="miles">Miles</option>
                      <option value="yards">Yards</option>
                    </select>
                  </div>
                  <div>
                    <Label>To</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={lengthTo}
                      onChange={(e) => setLengthTo(e.target.value)}
                    >
                      <option value="meters">Meters</option>
                      <option value="feet">Feet</option>
                      <option value="inches">Inches</option>
                      <option value="centimeters">Centimeters</option>
                      <option value="kilometers">Kilometers</option>
                      <option value="miles">Miles</option>
                      <option value="yards">Yards</option>
                    </select>
                  </div>
                </div>
                
                <Button onClick={convertLength} className="w-full">
                  Convert
                </Button>
                
                {lengthResult && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center justify-between">
                      <span>{lengthResult} {lengthTo}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(lengthResult, 'length')}
                      >
                        {copied === 'length' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Temperature Converter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Temperature Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="temp-value">Value</Label>
                  <Input
                    id="temp-value"
                    type="number"
                    placeholder="Enter temperature"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>From</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={tempFrom}
                      onChange={(e) => setTempFrom(e.target.value)}
                    >
                      <option value="celsius">Celsius</option>
                      <option value="fahrenheit">Fahrenheit</option>
                      <option value="kelvin">Kelvin</option>
                    </select>
                  </div>
                  <div>
                    <Label>To</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={tempTo}
                      onChange={(e) => setTempTo(e.target.value)}
                    >
                      <option value="celsius">Celsius</option>
                      <option value="fahrenheit">Fahrenheit</option>
                      <option value="kelvin">Kelvin</option>
                    </select>
                  </div>
                </div>
                
                <Button onClick={convertTemperature} className="w-full">
                  Convert
                </Button>
                
                {tempResult && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center justify-between">
                      <span>{tempResult}° {tempTo}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(tempResult, 'temp')}
                      >
                        {copied === 'temp' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="percentage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Percentage Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="percent-value">Percentage</Label>
                  <Input
                    id="percent-value"
                    type="number"
                    placeholder="e.g., 25"
                    value={percentValue}
                    onChange={(e) => setPercentValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="percent-of">Of</Label>
                  <Input
                    id="percent-of"
                    type="number"
                    placeholder="e.g., 200"
                    value={percentOf}
                    onChange={(e) => setPercentOf(e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={calculatePercentage} className="w-full">
                Calculate
              </Button>
              
              {percentResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {percentValue}% of {percentOf} = {percentResult}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(percentResult, 'percent')}
                    >
                      {copied === 'percent' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text-input">Text</Label>
                <Textarea
                  id="text-input"
                  placeholder="Enter your text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                />
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {wordStats.words}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Words</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {wordStats.characters}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Characters</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {wordStats.charactersNoSpaces}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">No Spaces</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {wordStats.lines}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Lines</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="random">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Random Number Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="random-min">Minimum</Label>
                  <Input
                    id="random-min"
                    type="number"
                    value={randomMin}
                    onChange={(e) => setRandomMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="random-max">Maximum</Label>
                  <Input
                    id="random-max"
                    type="number"
                    value={randomMax}
                    onChange={(e) => setRandomMax(e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={generateRandomNumber} className="w-full">
                Generate Random Number
              </Button>
              
              {randomResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {randomResult}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(randomResult, 'random')}
                    >
                      {copied === 'random' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="more">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold mb-2">Current Time</h3>
              <p className="text-lg font-mono">{new Date().toLocaleTimeString()}</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold mb-2">Today's Date</h3>
              <p className="text-lg">{new Date().toLocaleDateString()}</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold mb-2">Quick Access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">More tools coming soon!</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickTools;
