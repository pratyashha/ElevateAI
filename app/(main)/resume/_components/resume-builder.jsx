"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, AlertTriangle } from 'lucide-react';
import { saveResume } from '@/actions/resume';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import EntryForm from './entry-form';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineEye } from 'react-icons/ai';
import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
// User auth handled via server actions


// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });


// Basic resume schema
const resumeSchema = z.object({
    contactInfo: z.object({
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
        website: z.string().url('Invalid URL').optional().or(z.literal('')),
    }).optional(),
    summary: z.string().optional(),
    skills: z.string().optional(),
    experience: z.array(z.any()).optional(),
    education: z.array(z.any()).optional(),
    projects: z.array(z.any()).optional(),
    markdown: z.string().optional(),
});

const ResumeBuilder = ({ initialContent }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('edit');
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState(initialContent);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Parse initial content if it's a string
    const parsedContent = useMemo(() => {
        if (!initialContent) return {};
        try {
            return typeof initialContent === 'string' 
                ? JSON.parse(initialContent) 
                : initialContent;
        } catch (e) {
            console.error('Error parsing resume content:', e);
            return {};
        }
    }, [initialContent]);

    const entriesToMarkdown = (entries = [], sectionTitle) => {
        if (!entries || entries.length === 0) return '';
        const lines = entries.map((item) => {
            const dateRange = item.current ? `${item.startDate} - Present` : `${item.startDate}${item.endDate ? ` - ${item.endDate}` : ''}`;
            const header = [item.title, item.organization].filter(Boolean).join(' @ ');
            const description = item.description ? `\n\n${item.description}` : '';
            return `- ${header}${dateRange ? ` (${dateRange})` : ''}${description}`;
        });
        return [`## ${sectionTitle}`, '', ...lines].join('\n');
    };

    const getCombinedContent = () => {
        const {summary, skills, experience, education, projects} = formValues;
        return [
            getContactMarkdown(),
            summary ? `## Professional Summary\n\n${summary}` : '',
            skills ? `## Skills\n\n${skills}` : '',
            entriesToMarkdown(experience, 'Work Experience'),
            entriesToMarkdown(education, 'Education'),
            entriesToMarkdown(projects, 'Projects'),
        ]
            .filter(Boolean)
            .join('\n\n');
    };

    const { 
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: parsedContent?.contactInfo || {},
            summary: parsedContent?.summary || '',
            skills: parsedContent?.skills || '',
            experience: parsedContent?.experience || [],
            education: parsedContent?.education || [],
            projects: parsedContent?.projects || [],
            markdown: parsedContent?.markdown || '',
        },
    });

    const formValues = watch();

    useEffect(() => {
        if (activeTab === 'edit') {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }
    }, [formValues,activeTab]);

    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo?.email) parts.push(`✉️ <a href="mailto:${contactInfo.email}">${contactInfo.email}</a>`);
        if (contactInfo?.phone) parts.push(`☎️ <a href="tel:${contactInfo.phone}">${contactInfo.phone}</a>`);
        if (contactInfo?.location) parts.push(`📍 ${contactInfo.location}`);
        if (contactInfo?.linkedIn) parts.push(`🔗 <a href="${contactInfo.linkedIn}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`);
        if (contactInfo?.website) parts.push(`🌐 <a href="${contactInfo.website}" target="_blank" rel="noopener noreferrer">Website</a>`);

        const nameLine = parsedContent?.contactInfo?.email ? `## <div align="center">${parsedContent.contactInfo.email.split('@')[0]}</div>` : '';
        if (parts.length === 0 && !nameLine) return '';
        const infoLine = parts.length > 0 ? `<div align="center">${parts.join(' | ')}</div>` : '';
        return [nameLine, infoLine].filter(Boolean).join('\n\n');
    };


    useEffect(() => {
        if (parsedContent && Object.keys(parsedContent).length > 0) setActiveTab('markdown');
    }, [initialContent]);

    const onSubmit = async (data) => {
        try {
            await saveResume(JSON.stringify(data));
            toast.success('Resume saved successfully!');
            router.refresh();
        } catch (error) {
            const errorMessage = error?.message || 'Failed to save resume. Please check your database connection.';
            toast.error(errorMessage);
            console.error('Save error:', error);
        }
    };

    const previewRef = useRef(null);
    const exportRef = useRef(null);

    const handleDownload = async () => {
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const target = exportRef.current || previewRef.current;
            if (!target) return;

            const opt = {
                margin: 10,
                filename: 'resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(target).save();
        } catch (e) {
            console.error('PDF generation failed', e);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-2'>
                <div className='space-y-2'>
                    <h2 className='font-bold text-5xl md:text-6xl lg:text-7xl gradient-title'>Resume Builder</h2>
                    <p className='text-sm text-muted-foreground'>Build your resume with the help of our AI assistant.</p>
                </div>
                <div className='flex gap-2'>
                    <Button onClick={handleSubmit(onSubmit)} className='transition-colors hover:bg-primary/90'>
                        <Save className='w-4 h-4 mr-2' />
                        Save
                    </Button>
                    <Button variant='outline' onClick={handleDownload} className='transition-colors hover:bg-accent' disabled={isGeneratingPdf}>
                        {isGeneratingPdf ? (
                            <>
                            <Loader2 className='w-4 h-4 mr-2' />
                            Generating PDF...
                            </>
                        ) : (
                            <>
                            <Download className='w-4 h-4 mr-2' />
                             Download PDF</>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                        <div className='space-y-6'>
                                <h3 className='text-lg font-bold mb-4'>Contact Information</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border'>
                        
                                {/* Contact Information: Email*/}
                                    <div className='space-y-2'>
                                        <Label 
                                        className='text-sm font-medium'
                                        htmlFor="email">Email</Label>
                                        <Input 
                                            type="email" 
                                            id="email" 
                                            placeholder='Enter your email' 
                                            {...register("contactInfo.email")}
                                        />
                                        {errors.contactInfo?.email && (
                                            <p className='text-red-500 text-sm mt-1'>
                                                {errors.contactInfo.email.message}
                                            </p>
                                        )}
                                    </div>

                                {/* Contact Information: Phone*/}
                                    <div className='space-y-2'>
                                        <Label 
                                        className='text-sm font-medium'
                                        htmlFor="phone">Phone</Label>
                                        <Input 
                                            type="tel" 
                                            id="phone" 
                                            placeholder='Enter your phone' 
                                            {...register("contactInfo.phone")}
                                        />
                                        {errors.contactInfo?.phone && (
                                            <p className='text-red-500 text-sm mt-1'>
                                                {errors.contactInfo.phone.message}
                                            </p>
                                        )}
                                    </div>

                                {/* Contact Information: Location*/}
                                    <div className='space-y-2'>
                                        <Label 
                                        className='text-sm font-medium'
                                        htmlFor="location">Location</Label>
                                        <Input 
                                            type="text" 
                                            id="location" 
                                            placeholder='Enter your location' 
                                            {...register("contactInfo.location")}
                                        />
                                        {errors.contactInfo?.location && (
                                            <p className='text-red-500 text-sm mt-1'>
                                                {errors.contactInfo.location.message}
                                            </p>
                                        )}
                                    </div>

                                {/* Contact Information: LinkedIn  */}
                                    <div className='space-y-2'>
                                        <Label 
                                        className='text-sm font-medium'
                                        htmlFor="linkedIn">LinkedIn</Label>
                                        <Input 
                                            type="url" 
                                            id="linkedIn" 
                                            placeholder='Enter your LinkedIn URL' 
                                            {...register("contactInfo.linkedIn")}
                                        />
                                        {errors.contactInfo?.linkedIn && (
                                            <p className='text-red-500 text-sm mt-1'>
                                                {errors.contactInfo.linkedIn.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                            {/* Professional Summary*/}
                            <div className='space-y-2'>
                                <h3 className='text-lg font-bold mb-2'>Professional Summary</h3>
                                <Controller
                                name="summary"
                                control={control}
                                render={({field}) => (
                                    <Textarea
                                    {...field}
                                    placeholder='Enter your professional summary'
                                    className='min-h-[150px]'
                                    />
                                )}
                                />
                                {errors.summary && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.summary.message}
                                    </p>
                                )}
                            </div>

                            {/* Skills*/}
                            <div className='space-y-2'>
                                <h3 className='text-lg font-bold mb-2'>Skills</h3>
                                <Controller
                                name="skills"
                                control={control}
                                render={({field}) => (
                                    <Textarea
                                    {...field}
                                    placeholder='Enter your skills (comma-separated or bullet points)'
                                    className='min-h-[100px]'
                                    />
                                )}
                                />
                                {errors.skills && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.skills.message}
                                    </p>
                                )}
                            </div>

                            {/* Experience*/}
                            <div className='space-y-4'>
                                <h3 className='text-lg font-medium mb-2'>Work Experience</h3>
                                <Controller
                                name="experience"
                                control={control}
                                render={({field}) => (
                                    <EntryForm
                                    type="experience"
                                    entries={field.value}
                                    onChange={field.onChange}
                                    />
                                )}
                                />
                                {errors.experience && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.experience.message}
                                    </p>
                                )}
                            </div>
                        
                            {/* Education*/}
                            <div className='space-y-4'>
                                <h3 className='text-lg font-medium mb-2'>Education</h3>
                                <Controller
                                name="education"
                                control={control}
                                render={({field}) => (
                                    <EntryForm
                                    type="education"
                                    entries={field.value}
                                    onChange={field.onChange}
                                    />
                                )}
                                />
                                {errors.education && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.education.message}
                                    </p>
                                )}
                            </div>
                        
                            {/* Projects*/}
                            <div className='space-y-4'>
                                <h3 className='text-lg font-medium mb-2'>Projects</h3>
                                <Controller
                                name="projects"
                                control={control}
                                render={({field}) => (
                                    <EntryForm
                                    type="projects"
                                    entries={field.value}
                                    onChange={field.onChange}
                                    />
                                )}
                                />
                                {errors.projects && (
                                    <p className='text-red-500 text-sm mt-1'>
                                        {errors.projects.message}
                                    </p>
                                )}
                            </div>

                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="markdown">
                     <Button
                        type="button"
                        variant='link'
                        className='mb-2'
                        onClick={() => setShowMarkdownPreview((v) => !v)}
                     >
                        {showMarkdownPreview ? (
                            <>
                                <FaRegEdit className='h-4 w-4 mr-2' />
                                Edit Resume
                            </>
                        ) : (
                            <>
                                <AiOutlineEye className='h-4 w-4 mr-2' />
                                Show Preview
                            </>
                        )}
                     </Button>
                     <div className='flex items-center border border-yellow-500/60 text-yellow-600 rounded px-3 py-2 mb-4 bg-yellow-500/5'>
                        <AlertTriangle className='h-4 w-4 mr-2' />
                        <span className='text-sm'>You will lose edited markdown if you update the form data.</span>
                     </div>
                     {/* <Controller
                        name="markdown"
                        control={control}
                        render={({ field }) => (
                            <div data-color-mode="dark" className='rounded-lg border bg-background'>
                                {showMarkdownPreview ? (
                                    <div className='p-4'>
                                        <MarkdownPreview source={field.value || ''} />
                                    </div>
                                ) : (
                                    <div className='p-0'>
                                        <MDEditor value={field.value} onChange={field.onChange} height={400} />
                                    </div>
                                )}
                            </div>
                        )}
                     /> */}

                     <div className='rounded-lg border bg-background' ref={previewRef}>
                        <MDEditor
                            value={previewContent}
                            onChange={setPreviewContent}
                            height={800}
                            preview={showMarkdownPreview ? 'preview' : 'edit'}
                        />
                     </div>

                     {/* Hidden clean export container to avoid Tailwind color parsing issues */}
                     <div
                        ref={exportRef}
                        style={{
                            position: 'fixed',
                            left: '-10000px',
                            top: 0,
                            width: '794px', // approx A4 width at 96dpi
                            padding: '16px',
                            background: '#ffffff',
                            color: '#111827',
                        }}
                     >
                        <div data-color-mode="light">
                            <MarkdownPreview source={previewContent || ''} />
                        </div>
                     </div>
                    
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ResumeBuilder;