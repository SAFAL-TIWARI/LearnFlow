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

  // Advanced calculator states
  const [advancedInput, setAdvancedInput] = useState('');
  const [advancedResult, setAdvancedResult] = useState('');

  // Base converter states
  const [baseValue, setBaseValue] = useState('');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('2');
  const [baseResult, setBaseResult] = useState('');

  // Hash generator states
  const [hashInput, setHashInput] = useState('');
  const [hashType, setHashType] = useState('md5');
  const [hashResult, setHashResult] = useState('');

  // QR Code generator states
  const [qrText, setQrText] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

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

  const calculateAdvanced = () => {
    try {
      // Support for more advanced mathematical functions
      let expression = advancedInput
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/pow\(/g, 'Math.pow(')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      if (!/^[0-9+\-*/().\s,MathsincotaglqrtpowPIE]+$/.test(expression)) {
        setAdvancedResult('Invalid expression');
        return;
      }

      const result = Function('"use strict"; return (' + expression + ')')();
      setAdvancedResult(result.toString());
    } catch (error) {
      setAdvancedResult('Error');
    }
  };

  const convertBase = () => {
    try {
      const value = baseValue.trim();
      if (!value) return;

      const fromBaseNum = parseInt(fromBase);
      const toBaseNum = parseInt(toBase);

      if (fromBaseNum < 2 || fromBaseNum > 36 || toBaseNum < 2 || toBaseNum > 36) {
        setBaseResult('Invalid base (2-36)');
        return;
      }

      const decimal = parseInt(value, fromBaseNum);
      if (isNaN(decimal)) {
        setBaseResult('Invalid number for base ' + fromBase);
        return;
      }

      const result = decimal.toString(toBaseNum).toUpperCase();
      setBaseResult(result);
    } catch (error) {
      setBaseResult('Error');
    }
  };

  const generateHash = async () => {
    if (!hashInput.trim()) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);

      let hashBuffer;
      switch (hashType) {
        case 'sha1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data);
          break;
        case 'sha256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
          break;
        case 'sha512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data);
          break;
        default:
          // For MD5, we'll use a simple hash function (not cryptographically secure)
          setHashResult(simpleHash(hashInput));
          return;
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHashResult(hashHex);
    } catch (error) {
      setHashResult('Error generating hash');
    }
  };

  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const generateQR = () => {
    if (!qrText.trim()) return;
    // For demo purposes, we'll just show that QR was generated
    // In a real implementation, you'd use a QR code library
    setQrGenerated(true);
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
    <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center mb-4 sm:mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-2xl sm:text-3xl font-bold">Quick Tools</h1>
      </div>

      <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Tools</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Basic Calculator */}
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
                  onKeyDown={(e) => e.key === 'Enter' && calculateExpression()}
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

          {/* Percentage Calculator */}
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

          {/* Text Analysis */}
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
                  rows={4}
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

          {/* Random Number Generator */}
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

        <TabsContent value="advanced" className="space-y-6">
          {/* Advanced Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Scientific Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="advanced-input">Mathematical Expression</Label>
                <Input
                  id="advanced-input"
                  placeholder="e.g., sin(pi/2), sqrt(16), log(100)"
                  value={advancedInput}
                  onChange={(e) => setAdvancedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && calculateAdvanced()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports: sin, cos, tan, log, ln, sqrt, pow, pi, e
                </p>
              </div>

              <Button onClick={calculateAdvanced} className="w-full">
                Calculate
              </Button>

              {advancedResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Result: {advancedResult}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(advancedResult, 'advanced')}
                    >
                      {copied === 'advanced' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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

          {/* Base Number Converter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Number Base Converter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="base-value">Number</Label>
                <Input
                  id="base-value"
                  placeholder="Enter number to convert"
                  value={baseValue}
                  onChange={(e) => setBaseValue(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Base</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={fromBase}
                    onChange={(e) => setFromBase(e.target.value)}
                  >
                    <option value="2">Binary (2)</option>
                    <option value="8">Octal (8)</option>
                    <option value="10">Decimal (10)</option>
                    <option value="16">Hexadecimal (16)</option>
                    <option value="36">Base 36</option>
                  </select>
                </div>
                <div>
                  <Label>To Base</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={toBase}
                    onChange={(e) => setToBase(e.target.value)}
                  >
                    <option value="2">Binary (2)</option>
                    <option value="8">Octal (8)</option>
                    <option value="10">Decimal (10)</option>
                    <option value="16">Hexadecimal (16)</option>
                    <option value="36">Base 36</option>
                  </select>
                </div>
              </div>

              <Button onClick={convertBase} className="w-full">
                Convert
              </Button>

              {baseResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Result: {baseResult}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(baseResult, 'base')}
                    >
                      {copied === 'base' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hash Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hash Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hash-input">Text to Hash</Label>
                <Textarea
                  id="hash-input"
                  placeholder="Enter text to generate hash..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Hash Type</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={hashType}
                  onChange={(e) => setHashType(e.target.value)}
                >
                  <option value="md5">MD5 (Simple Hash)</option>
                  <option value="sha1">SHA-1</option>
                  <option value="sha256">SHA-256</option>
                  <option value="sha512">SHA-512</option>
                </select>
              </div>

              <Button onClick={generateHash} className="w-full">
                Generate Hash
              </Button>

              {hashResult && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono break-all">{hashResult}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(hashResult, 'hash')}
                    >
                      {copied === 'hash' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                QR Code Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-text">Text or URL</Label>
                <Textarea
                  id="qr-text"
                  placeholder="Enter text or URL to generate QR code..."
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={generateQR} className="w-full">
                Generate QR Code
              </Button>

              {qrGenerated && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <div className="w-32 h-32 bg-white border-2 border-gray-300 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code Preview</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    QR Code generated for: {qrText.substring(0, 50)}...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: This is a demo. In production, use a QR code library.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Time & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold mb-2">Current Time</h3>
              <p className="text-lg font-mono">{new Date().toLocaleTimeString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </Card>

            <Card className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold mb-2">Today's Date</h3>
              <p className="text-lg">{new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default QuickTools;
