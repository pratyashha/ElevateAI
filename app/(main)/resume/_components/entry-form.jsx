"use client"
import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { entrySchema } from '@/app/lib/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { improveWithAI } from '@/actions/resume';
import { parse, format } from 'date-fns';



const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = parse(dateString, 'yyyy-MM', new Date());
    return format(date, 'MMM yyyy');
};

const EntryForm = ({ type, entries, onChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            current: false,
        },
    });

    const Current = watch('current');
    
    const handleDelete = (index) => {
        const newEntries = entries.filter((_, i) => i !== index);
        onChange(newEntries);
    };

    const handleImproveDescription = async () => {
        const description = watch('description');
        if(!description) {
            toast.error('Description is required');
            return;
        }
        setIsImproving(true);
        try {
            const improved = await improveWithAI({
                current: description, 
                type: type.toLowerCase()
            });
            setValue('description', improved);
            toast.success('Description improved successfully!');
        } catch (error) {
            toast.error('Failed to improve description');
        } finally {
            setIsImproving(false);
        }
    };

    const onSubmit = (data) => {
        if (onChange) {
            const currentEntries = entries?.[type] || [];
            onChange(type, [...currentEntries, data]);
            reset();
            setIsAdding(false);
            toast.success(`${type} added successfully!`);
        }
    };

    const handleAdd = handleSubmit((data) =>
    {
        const formattedEntry = {
            ...data,
            startDate: formatDisplayDate(data.startDate),
            endDate: data.current ? "": formatDisplayDate(data.endDate),  
        };
        onChange([...entries, formattedEntry]);
        reset();
        setIsAdding(false);
    });

    useEffect(() => {
        if (entries && entries[type]) {
            const entryData = entries[type];
            if (entryData && entryData.length > 0) {
                // Set the first entry's values
                const firstEntry = entryData[0];
                reset({
                    title: firstEntry.title || "",
                    organization: firstEntry.organization || "",
                    startDate: firstEntry.startDate || "",
                    endDate: firstEntry.endDate || "",
                    description: firstEntry.description || "",
                    current: firstEntry.current || false,
                });
            }
        }
    }, [entries, type, reset]);

    useEffect(() => {
        if (Current) {
            setValue('endDate', '');
        }
    }, [Current, setValue]);

    return (
        <div className='space-y-4'>
            <div className='space-y-4'>
                {entries.map((item, index) => {
                    return(
                        <Card key={index}>
                            <CardHeader className='flex items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>{item.title} @ {item.organization}</CardTitle>
                                <Button variant='outline' size='icon' type='button' onClick={() => handleDelete(index)}>
                                    <X className='h-4 w-4' />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className='text-sm text-muted-foreground'>
                                    {item.current ? `${item.startDate} - Present` : `${item.startDate} - ${item.endDate}`}
                                    <div className='mt-2 text-sm whitespace-pre-wrap'>
                                        {item.description}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}



            </div>

            {isAdding && (
                <Card>
                    <CardHeader> <CardTitle>Add {type}</CardTitle> </CardHeader>
                    <CardContent>   
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>

                            <div className='space-y-2'>
                                
                                <Input placeholder ="Title/Position"
                                {...register("title")}
                                error={errors.title}/>

                                {errors.title && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* {organization} */}
                            <div className='space-y-2'>
                                
                                <Input placeholder ="Organization/Company Name"
                                {...register("organization")}
                                error={errors.organization}/>

                                {errors.organization && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.organization.message}
                                    </p>
                                )}
                            </div>
                            </div> 

                            <div className='grid grid-cols-2 gap-4'>
 {/* {startDate} */}
 <div className='space-y-2'>
                                
                                <Input 
                                type='month'
                                placeholder ="Start Date"
                                {...register("startDate")}
                                error={errors.startDate}/>

                                {errors.startDate && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.startDate.message}
                                    </p>
                                )}
                            </div>

                            {/* {endDate} */}
                            <div className='space-y-2'>
                                
                                <Input 
                                type='month'
                                placeholder ="End Date"
                                {...register("endDate")}
                                disabled={Current}
                                error={errors.endDate}/>

                                {errors.endDate && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.endDate.message}
                                    </p>
                                )}
                            </div>
                            </div>
                           
                           <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='current'
                                checked={Current}
                                onCheckedChange={(checked) => {
                                    setValue('current', checked);
                                    if (checked) {
                                        setValue('endDate', '');
                                    }
                                }}
                            />
                            <Label htmlFor="current" className='cursor-pointer'>{type === 'education' ? 'Currently studying here' : 'Currently working here'}</Label>
                           </div>
                            
                            {/* {description} */}
                            <div className='space-y-2'>
                                
                                <Textarea placeholder ={`Description of your ${type.toLowerCase()}`}
                                className="h-32"
                                {...register("description")}
                                error={errors.description}/>
                                {errors.description && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                            
                              
                        </div>
                    

                    <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleImproveDescription}
                    disabled={isImproving || !watch('description')}
                    >
                        {isImproving ? (
                            <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Improving...
                            </>
                         ) : (
                            <>
                            <Sparkles className='h-4 w-4 mr-2' />
                            Improve with AI
                            </>
                        )}


                    </Button>
                    </CardContent>
                    <CardFooter className='flex justify-end space-x-2'>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>{ reset(); setIsAdding(false);
                        }}
                        >
                         Cancel
                        </Button>

                        <Button
                        type="button"
                        variant="outline"
                        onClick={handleAdd}
                        >
                         <PlusCircle className='h-4 w-4 mr-2' />
                         Add Entry
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {!isAdding && (
                <Button className='w-full' variant='outline' onClick={() => setIsAdding(true)}>
                    <PlusCircle className='h-4 w-4 mr-2' />
                    Add {type}
                </Button>
                

            )}
        </div>
    );
};

export default EntryForm;