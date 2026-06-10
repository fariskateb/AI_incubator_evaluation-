import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { USERS, INVITATIONS, ROLE_LABEL, type Role, type Invitation } from '@/data';
import { UserPlus, ShieldCheck, Mail, ServerCog } from 'lucide-react';

const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-[#C9A227]/10 text-amber-800 border-[#C9A227]/40',
  evaluator: 'bg-[#006633]/10 text-[#006633] border-[#006633]/30',
  investor: 'bg-sky-50 text-sky-700 border-sky-300',
  student: 'bg-emerald-50 text-emerald-700 border-emerald-300',
};

const INV_STATUS = {
  pending: { label: 'بانتظار القبول', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  accepted: { label: 'مقبولة', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  expired: { label: 'منتهية', cls: 'bg-red-50 text-red-700 border-red-300' },
};

export default function Admin() {
  const [invitations, setInvitations] = useState<Invitation[]>(INVITATIONS);
  const [open, setOpen] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState<Role>('student');

  const sendInvite = () => {
    if (!invEmail.includes('@')) return;
    setInvitations([{ id: `i${Date.now()}`, email: invEmail, role: invRole, invitedBy: 'المشرف العام', sentAt: 'الآن', status: 'pending' }, ...invitations]);
    setInvEmail('');
    setOpen(false);
  };

  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">المستخدمون</TabsTrigger>
        <TabsTrigger value="invites">الدعوات</TabsTrigger>
        <TabsTrigger value="settings">إعدادات النظام</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-start">المستخدم</TableHead>
                  <TableHead className="text-start">الدور</TableHead>
                  <TableHead className="text-start">آخر دخول</TableHead>
                  <TableHead className="text-start">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USERS.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground" dir="ltr">{u.email}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{u.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs">تعديل الدور</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700">حظر</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invites" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            التسجيل بالدعوة فقط — لا يمكن إنشاء حساب دون دعوة من مشرف.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-bold"><UserPlus className="w-4 h-4" /> دعوة مستخدم</Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader className="text-start">
                <DialogTitle>دعوة مستخدم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-email">البريد الإلكتروني</Label>
                  <Input id="inv-email" type="email" dir="ltr" className="text-left" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="name@stu.kau.edu.sa" />
                </div>
                <div className="space-y-1.5">
                  <Label id="inv-role-label">الدور</Label>
                  <Select value={invRole} onValueChange={(v) => setInvRole(v as Role)}>
                    <SelectTrigger aria-labelledby="inv-role-label"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">طالب</SelectItem>
                      <SelectItem value="evaluator">مقيّم</SelectItem>
                      <SelectItem value="investor">مستثمر</SelectItem>
                      <SelectItem value="admin">مشرف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  سيصل المدعو رابط تفعيل صالح لمدة 7 أيام لتعيين كلمة المرور. الصلاحيات تُفرض على الخادم حسب الدور.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={sendInvite} className="gap-2 font-bold"><Mail className="w-4 h-4" /> إرسال الدعوة</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-start">البريد</TableHead>
                  <TableHead className="text-start">الدور</TableHead>
                  <TableHead className="text-start">أرسلها</TableHead>
                  <TableHead className="text-start">التاريخ</TableHead>
                  <TableHead className="text-start">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell dir="ltr" className="text-left font-medium">{inv.email}</TableCell>
                    <TableCell><Badge variant="outline" className={ROLE_BADGE[inv.role]}>{ROLE_LABEL[inv.role]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{inv.invitedBy}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{inv.sentAt}</TableCell>
                    <TableCell><Badge variant="outline" className={INV_STATUS[inv.status].cls}>{INV_STATUS[inv.status].label}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><ServerCog className="w-4 h-4 text-primary" /> الذكاء الاصطناعي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>نموذج التقييم</Label>
                <Select defaultValue="claude-sonnet-4-6">
                  <SelectTrigger dir="ltr"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4-6">claude-sonnet-4-6</SelectItem>
                    <SelectItem value="claude-opus-4-8">claude-opus-4-8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>نموذج استخراج Excel</Label>
                <Select defaultValue="claude-haiku-4-5">
                  <SelectTrigger dir="ltr"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-haiku-4-5">claude-haiku-4-5</SelectItem>
                    <SelectItem value="claude-sonnet-4-6">claude-sonnet-4-6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-secondary border border-border rounded-sm p-3 text-xs text-muted-foreground leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>مفتاح Anthropic API يُدار على الخادم عبر متغير البيئة <code dir="ltr" className="text-primary">ANTHROPIC_API_KEY</code> — لا يُخزَّن في المتصفح إطلاقاً. الميزانية الشهرية الحالية: <b className="text-foreground">200 ريال</b> · المستهلك: <b className="text-foreground">37 ريال</b>.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> البريد الإلكتروني (Resend)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between bg-secondary border border-border rounded-sm p-3">
              <div>
                <div className="text-sm font-semibold" dir="ltr">reports@incubator.kau.edu.sa</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">نطاق الإرسال الموثّق — سجلات SPF / DKIM / DMARC مفعّلة</div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">موثّق</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              أثناء التطوير يُستخدم نطاق Resend التجريبي (onboarding@resend.dev — يرسل لبريد المطوّر فقط). قبل الإطلاق يُوثَّق نطاق فرعي جامعي بإضافة 3 سجلات DNS، فتصل التقارير والدعوات لصناديق الوارد مباشرة.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
