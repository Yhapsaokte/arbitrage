'use client';

import { Card } from '@/components/ui/card';
import { computeAll, euro } from '@/lib/calculs/engine';
import { useSimulateurStore } from '@/lib/store/use-simulateur-store';
import { Bar, BarChart, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function VisualisationsPage() {
  const { scenarios, settings, params } = useSimulateurStore();
  const rows = computeAll(scenarios, settings, params).map(({ scenario, result }) => ({
    name: scenario.nom,
    net: result.netDirigeant,
    cout: result.coutTotalSociete,
    is: result.isEstime,
    score: result.scoreGlobal,
  }));
  const best = rows.sort((a, b) => b.score - a.score)[0];
  const donut = best ? [
    { name: 'Net', value: best.net },
    { name: 'Coût', value: best.cout - best.net },
    { name: 'IS', value: best.is },
  ] : [];

  return <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <Card><h3 className="mb-2 font-medium">Bar chart comparatif</h3><div className="h-72"><ResponsiveContainer><BarChart data={rows}><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(v) => euro(Number(v))}/><Bar dataKey="net" fill="#0f766e"/><Bar dataKey="cout" fill="#0f3d68"/></BarChart></ResponsiveContainer></div></Card>
    <Card><h3 className="mb-2 font-medium">Répartition mix optimal</h3><div className="h-72"><ResponsiveContainer><PieChart><Pie data={donut} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>{donut.map((_, i) => <Cell key={i} fill={['#0f766e','#f59e0b','#1d4ed8'][i]} />)}</Pie><Tooltip formatter={(v) => euro(Number(v))}/></PieChart></ResponsiveContainer></div></Card>
    <Card className="xl:col-span-2"><h3 className="mb-2 font-medium">Radar équilibre global</h3><div className="h-72"><ResponsiveContainer><RadarChart data={rows}><PolarGrid/><PolarAngleAxis dataKey="name"/><Radar dataKey="score" stroke="#0f3d68" fill="#0f3d68" fillOpacity={0.5}/><Tooltip/></RadarChart></ResponsiveContainer></div></Card>
  </div>;
}
