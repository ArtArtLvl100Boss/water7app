'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { YearMonthPicker } from '@/components/year-month-picker';
import { useReports } from '@/hooks/use-reports';
import type { Expense, Report } from '@/types/report';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { PasscodeDialog } from '@/components/passcode-dialog';

export default function EditReportClient({ id }: { id: string }) {
    const router = useRouter();
    const { updateReport } = useReports();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<Date>(new Date());
    const [waterSales, setWaterSales] = useState('');
    const [soapSales, setSoapSales] = useState('');
    const [expenses, setExpenses] = useState<Expense[]>([
        { id: crypto.randomUUID(), description: '', amount: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<Report> | null>(null);

    // Fetch report data
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const reportRef = doc(db, 'reports', id);
                const reportSnap = await getDoc(reportRef);

                if (reportSnap.exists()) {
                    const data = reportSnap.data();

                    // Safely convert Firestore date to JavaScript Date
                    let reportDate = new Date();

                    try {
                        if (data.date instanceof Timestamp) {
                            reportDate = data.date.toDate();
                        } else if (
                            data.date &&
                            typeof data.date === 'object' &&
                            'seconds' in data.date
                        ) {
                            // Handle Firestore timestamp that's been serialized
                            reportDate = new Date(data.date.seconds * 1000);
                        } else if (
                            data.date &&
                            typeof data.date.toDate === 'function'
                        ) {
                            reportDate = data.date.toDate();
                        } else if (data.date) {
                            // Try to parse as string or number
                            reportDate = new Date(data.date);
                        }

                        // Validate the date is valid
                        if (isNaN(reportDate.getTime())) {
                            throw new Error('Invalid date');
                        }
                    } catch (err) {
                        console.error('Error parsing date:', err);
                        reportDate = new Date(); // Fallback to current date
                        toast({
                            title: 'Date Error',
                            description:
                                "Could not parse report date. Using today's date instead.",
                            variant: 'destructive',
                        });
                    }

                    setDate(reportDate);
                    setWaterSales(data.waterSales || '');
                    setSoapSales(data.soapSales || '');

                    // Ensure expenses have valid structure
                    if (
                        Array.isArray(data.expenses) &&
                        data.expenses.length > 0
                    ) {
                        const validExpenses = data.expenses.map((exp) => ({
                            id: exp.id || crypto.randomUUID(),
                            description: exp.description || '',
                            amount: exp.amount || '',
                        }));
                        setExpenses(validExpenses);
                    }
                } else {
                    toast({
                        title: 'Error',
                        description: 'Report not found',
                        variant: 'destructive',
                    });
                    router.push('/reports');
                }
            } catch (error) {
                console.error('Error fetching report:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load report data',
                    variant: 'destructive',
                });
                router.push('/reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id, router, toast]);

    // Rest of your component code remains the same
    const addExpense = () => {
        setExpenses([
            ...expenses,
            { id: crypto.randomUUID(), description: '', amount: '' },
        ]);
    };

    const removeExpense = (id: string) => {
        if (expenses.length > 1) {
            setExpenses(expenses.filter((expense) => expense.id !== id));
        }
    };

    const updateExpense = (
        id: string,
        field: 'description' | 'amount',
        value: string
    ) => {
        setExpenses(
            expenses.map((expense) =>
                expense.id === id ? { ...expense, [field]: value } : expense
            )
        );
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();

        // Create report object
        const reportData: Partial<Report> = {
            date,
            waterSales,
            soapSales,
            expenses,
        };

        // Store the form data for later submission
        setFormData(reportData);

        // Show passcode dialog
        setShowPasscodeDialog(true);
    };

    const handlePasscodeSuccess = async () => {
        setShowPasscodeDialog(false);
        setIsSubmitting(true);

        try {
            if (!formData) return;

            // Update report in Firestore
            await updateReport(id, formData);

            toast({
                title: 'Report updated',
                description: 'Your report has been successfully updated.',
            });

            // Redirect to reports page
            router.push('/reports');
        } catch (error) {
            console.error('Error updating report:', error);
            toast({
                title: 'Error',
                description: 'Failed to update report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasscodeCancel = () => {
        setShowPasscodeDialog(false);
        setFormData(null);
    };

    if (loading) {
        return (
            <div className='container mx-auto px-4 py-6 max-w-2xl'>
                <h1 className='text-2xl font-bold mb-6'>Edit Report</h1>
                <div className='flex justify-center items-center h-64'>
                    <p>Loading report data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto px-4 py-6 max-w-2xl'>
            <h1 className='text-2xl font-bold mb-6'>Edit Report</h1>

            <form onSubmit={handleSubmitRequest}>
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle>Report Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='report-date'>Report Date</Label>
                            <Popover
                                open={isCalendarOpen}
                                onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id='report-date'
                                        variant={'outline'}
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !date && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {date ? (
                                            format(date, 'MMMM d, yyyy')
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className='w-auto p-4'
                                    align='start'>
                                    <YearMonthPicker
                                        date={date}
                                        onDateChange={(newDate) => {
                                            setDate(newDate);
                                            setIsCalendarOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='water-sales'>Water Sales (₱)</Label>
                            <Input
                                id='water-sales'
                                type='number'
                                placeholder='0.00'
                                value={waterSales}
                                onChange={(e) => setWaterSales(e.target.value)}
                                required
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='soap-sales'>Soap Sales (₱)</Label>
                            <Input
                                id='soap-sales'
                                type='number'
                                placeholder='0.00'
                                value={soapSales}
                                onChange={(e) => setSoapSales(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle>Expense Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {expenses.map((expense) => (
                            <div
                                key={expense.id}
                                className='flex items-end'>
                                <div className='grid grid-cols-2 gap-2 items-end flex-1'>
                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor={`expense-desc-${expense.id}`}>
                                            Description
                                        </Label>
                                        <Input
                                            id={`expense-desc-${expense.id}`}
                                            placeholder='Expense description'
                                            value={expense.description}
                                            onChange={(e) =>
                                                updateExpense(
                                                    expense.id,
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2 flex-1'>
                                        <Label
                                            htmlFor={`expense-amount-${expense.id}`}>
                                            Amount (₱)
                                        </Label>
                                        <Input
                                            id={`expense-amount-${expense.id}`}
                                            type='number'
                                            placeholder='0.00'
                                            value={expense.amount}
                                            onChange={(e) =>
                                                updateExpense(
                                                    expense.id,
                                                    'amount',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    type='button'
                                    onClick={() => removeExpense(expense.id)}
                                    disabled={expenses.length <= 1}>
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant='outline'
                            type='button'
                            onClick={addExpense}
                            className='w-full'>
                            <Plus className='mr-2 h-4 w-4' /> Add Expense
                        </Button>
                    </CardFooter>
                </Card>

                <div className='flex gap-4 justify-end'>
                    <Button
                        variant='outline'
                        type='button'
                        onClick={() => router.push('/reports')}
                        disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Report'}
                    </Button>
                </div>
            </form>

            <PasscodeDialog
                isOpen={showPasscodeDialog}
                onClose={handlePasscodeCancel}
                onSuccess={handlePasscodeSuccess}
                actionType='edit'
            />
        </div>
    );
}
