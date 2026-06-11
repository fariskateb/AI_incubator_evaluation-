import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECTS, SECTORS, DECISION_LABEL, DECISION_STYLE, scoreTone, type Role } from '@/data';
import { Search, Plus } from 'lucide-react';

export default function Projects({ role, openReport, onNew }: { role: Role; openReport: (id: string) => void; onNew: () => void }) {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('all');
  const canEdit = role === 'admin' || role === 'evaluator';

  const rows = useMemo(
    () =>
      [...PROJECTS]
        .sort((a, b) => b.totalScore - a.totalScore)
        .filter((p) => (sector === 'all' || p.sector === sector) && (q === '' || p.name.includes(q) || p.code.includes(q))),
    [q, sector],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="ps-9" placeholder="ابحث بالاسم أو الرمز..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل القطاعات</SelectItem>
            {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {canEdit && (
          <Button className="font-bold gap-2" onClick={onNew}><Plus className="w-4 h-4" /> مشروع جديد</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-start">المشروع</TableHead>
                <TableHead className="text-start">القطاع</TableHead>
                <TableHead className="text-start">المرحلة</TableHead>
                <TableHead className="text-center">الدرجة</TableHead>
                <TableHead className="text-start">القرار</TableHead>
                <TableHead className="text-start">آخر تقييم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => openReport(p.id)}>
                  <TableCell>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground" dir="ltr">{p.code}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.sector}</TableCell>
                  <TableCell className="text-muted-foreground">{p.stage}</TableCell>
                  <TableCell className={`text-center text-base font-bold ${scoreTone(p.totalScore)}`}>{p.totalScore}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={DECISION_STYLE[p.decision]}>{DECISION_LABEL[p.decision]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs" dir="ltr">{p.evaluatedAt}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">لا توجد نتائج مطابقة</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
