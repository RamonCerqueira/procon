import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Fuel, 
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function MarketReports() {
  const priceData = [
    { name: 'Jan', Gasolina: 5.49, Diesel: 4.89, Etanol: 3.99 },
    { name: 'Fev', Gasolina: 5.59, Diesel: 4.99, Etanol: 4.09 },
    { name: 'Mar', Gasolina: 5.69, Diesel: 4.85, Etanol: 4.19 },
    { name: 'Abr', Gasolina: 5.45, Diesel: 4.79, Etanol: 3.89 },
    { name: 'Mai', Gasolina: 5.39, Diesel: 4.69, Etanol: 3.79 },
    { name: 'Jun', Gasolina: 5.49, Diesel: 4.75, Etanol: 3.85 },
  ];

  const cestaBasicaData = [
    { name: 'Jan', Valor: 650.00 },
    { name: 'Fev', Valor: 645.00 },
    { name: 'Mar', Valor: 660.00 },
    { name: 'Abr', Valor: 675.50 },
    { name: 'Mai', Valor: 670.00 },
    { name: 'Jun', Valor: 685.00 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Relatórios de Mercado</h2>
          <p className="text-gray-500">Análise de variação de preços e tendências de consumo.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert('Filtros em desenvolvimento')}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" onClick={() => alert('Seleção de período em desenvolvimento')}>
            <Calendar className="mr-2 h-4 w-4" />
            Período
          </Button>
          <Button onClick={() => alert('Exportação para PDF iniciada...')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Cesta Básica</p>
                <h3 className="text-2xl font-bold text-gray-900">R$ 685,00</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-red-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.5% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Combustíveis (Média)</p>
                <h3 className="text-2xl font-bold text-gray-900">R$ 5,49</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Fuel className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <TrendingDown className="h-4 w-4 mr-1" />
              -1.2% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Pesquisas Realizadas</p>
                <h3 className="text-2xl font-bold text-gray-900">1.250</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% de abrangência
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Variação de Combustíveis (Semestral)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Gasolina" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="Diesel" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Etanol" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução da Cesta Básica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cestaBasicaData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Valor" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
