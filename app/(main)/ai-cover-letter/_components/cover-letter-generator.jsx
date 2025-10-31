"use client"
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Copy, Sparkles, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { generateCoverLetter, saveCoverLetter } from '@/actions/cover-letter';
import { toast } from 'sonner';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineEye } from 'react-icons/ai';

// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const coverLetterSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    jobDescription: z.string().min(1, 'Job description is required'),
    contactInfo: z.object({
        fullName: z.string().optional(),
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
    }).optional(),
});

const CoverLetterGenerator = () => {
    const { user } = useUser();
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const [markdownContent, setMarkdownContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const previewRef = useRef(null);
    const exportRef = useRef(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(coverLetterSchema),
        defaultValues: {
            contactInfo: {
                fullName: user?.fullName || '',
                email: user?.primaryEmailAddress?.emailAddress || '',
            },
        },
    });

    const formValues = watch();

    const handleGenerate = async (data) => {
        setIsGenerating(true);
        try {
            const generated = await generateCoverLetter({
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                jobDescription: data.jobDescription,
                contactInfo: data.contactInfo || {},
            });
            
            setMarkdownContent(generated);
            toast.success('Cover letter generated successfully!');
        } catch (error) {
            toast.error(error?.message || 'Failed to generate cover letter');
            console.error('Generation error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            await saveCoverLetter({
                companyName: formValues.companyName,
                jobTitle: formValues.jobTitle,
                jobDescription: formValues.jobDescription,
                coverLetter: markdownContent,
            });
            toast.success('Cover letter saved successfully!');
        } catch (error) {
            toast.error(error?.message || 'Failed to save cover letter');
        }
    };

    const handleDownload = async () => {
        try {
            if (!markdownContent) {
                toast.error('No content to download');
                return;
            }

            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

            const leftMargin = 20;
            const rightMargin = 20;
            const topMargin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const usableWidth = pageWidth - leftMargin - rightMargin;
            const pageHeight = doc.internal.pageSize.getHeight();
            let cursorY = topMargin;

            // Set font
            doc.setFont('times', 'normal');
            
            const lines = markdownContent.split('\n');
            
            lines.forEach((line) => {
                const trimmed = line.trim();
                
                // Check if we need a new page
                if (cursorY > pageHeight - topMargin - 10) {
                    doc.addPage();
                    cursorY = topMargin;
                }
                
                if (trimmed === '') {
                    cursorY += 5; // Paragraph spacing
                    return;
                }
                
                // Date formatting (right-aligned)
                if (trimmed.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/i)) {
                    doc.setFontSize(11);
                    const textWidth = doc.getTextWidth(trimmed);
                    doc.text(trimmed, pageWidth - rightMargin - textWidth, cursorY);
                    cursorY += 8;
                    return;
                }
                
                // Hiring Manager or Company Name
                if (trimmed.match(/^(Hiring\s+Manager|The\s+.+)$/i)) {
                    doc.setFontSize(11);
                    const wrapped = doc.splitTextToSize(trimmed, usableWidth);
                    doc.text(wrapped, leftMargin, cursorY);
                    cursorY += 6 * wrapped.length;
                    return;
                }
                
                // Salutation
                if (trimmed.match(/^Dear\s+/i)) {
                    doc.setFontSize(11);
                    doc.text(trimmed, leftMargin, cursorY);
                    cursorY += 8;
                    return;
                }
                
                // Regular text (paragraphs)
                doc.setFontSize(11);
                const wrapped = doc.splitTextToSize(trimmed, usableWidth);
                wrapped.forEach((wline) => {
                    if (cursorY > pageHeight - topMargin - 10) {
                        doc.addPage();
                        cursorY = topMargin;
                    }
                    doc.text(wline, leftMargin, cursorY);
                    cursorY += 6;
                });
                cursorY += 2; // Paragraph spacing
            });

            doc.save(`Cover_Letter_${Date.now()}.pdf`);
            toast.success('Cover letter downloaded successfully!');
        } catch (e) {
            console.error('PDF generation failed', e);
            toast.error('Failed to generate PDF: ' + (e?.message || 'Unknown error'));
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdownContent);
            toast.success('Cover letter copied to clipboard!');
        } catch (e) {
            console.error('Copy failed', e);
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h2 className="font-bold text-5xl md:text-6xl lg:text-7xl gradient-title">
                        Cover Letter Builder
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Generate and customize your cover letter with AI assistance
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button variant="ghost" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Contact Info and Job Details */}
                <div className="space-y-6">
                    {/* Contact Info Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Contact Information</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Edit your contact details that will appear in the cover letter
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Enter your full name"
                                            {...register('contactInfo.fullName')}
                                        />
                                        {errors.contactInfo?.fullName && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.contactInfo.fullName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            {...register('contactInfo.email')}
                                        />
                                        {errors.contactInfo?.email && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.contactInfo.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            {...register('contactInfo.phone')}
                                        />
                                        {errors.contactInfo?.phone && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.contactInfo.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            placeholder="Enter your location"
                                            {...register('contactInfo.location')}
                                        />
                                        {errors.contactInfo?.location && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.contactInfo.location.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="linkedIn">LinkedIn URL (Optional)</Label>
                                        <Input
                                            id="linkedIn"
                                            type="url"
                                            placeholder="Enter your LinkedIn profile URL"
                                            {...register('contactInfo.linkedIn')}
                                        />
                                        {errors.contactInfo?.linkedIn && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.contactInfo.linkedIn.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Provide information about the position you're applying for
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        placeholder="Enter company name"
                                        {...register('companyName')}
                                    />
                                    {errors.companyName && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.companyName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle">Job Title</Label>
                                    <Input
                                        id="jobTitle"
                                        placeholder="Enter job title"
                                        {...register('jobTitle')}
                                    />
                                    {errors.jobTitle && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.jobTitle.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jobDescription">Job Description</Label>
                                    <Textarea
                                        id="jobDescription"
                                        placeholder="Paste the job description here"
                                        className="min-h-[200px]"
                                        {...register('jobDescription')}
                                    />
                                    {errors.jobDescription && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.jobDescription.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="w-full transition-colors hover:bg-primary/90"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Cover Letter
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Cover Letter */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Cover Letter</CardTitle>
                                {markdownContent && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSave}
                                            className="transition-colors hover:bg-accent"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="transition-colors hover:bg-accent"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownload}
                                            className="transition-colors hover:bg-accent"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {markdownContent ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="p-0"
                                            onClick={() => setShowMarkdownPreview((v) => !v)}
                                        >
                                            {showMarkdownPreview ? (
                                                <>
                                                    <FaRegEdit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </>
                                            ) : (
                                                <>
                                                    <AiOutlineEye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex items-center border border-yellow-500/60 text-yellow-600 rounded px-3 py-2 mb-4 bg-yellow-500/5">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        <span className="text-sm">You can edit the cover letter below. Changes will be preserved when you save.</span>
                                    </div>
                                    <div className="rounded-lg border bg-background" ref={previewRef}>
                                        <MDEditor
                                            value={markdownContent}
                                            onChange={setMarkdownContent}
                                            height={600}
                                            preview={showMarkdownPreview ? 'preview' : 'edit'}
                                        />
                                    </div>
                                    {/* Hidden export container - clean HTML for PDF */}
                                    <div
                                        ref={exportRef}
                                        style={{
                                            position: 'fixed',
                                            left: '-10000px',
                                            top: 0,
                                            width: '794px',
                                            padding: '20px',
                                            backgroundColor: '#ffffff',
                                            color: '#111827',
                                            fontFamily: 'Georgia, serif',
                                            lineHeight: '1.8',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: '24px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                backgroundColor: '#ffffff',
                                                color: '#111827',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: markdownContent
                                                    .split('\n')
                                                    .map((line, idx, arr) => {
                                                        const trimmed = line.trim();
                                                        const prevLine = idx > 0 ? arr[idx - 1].trim() : '';
                                                        
                                                        if (trimmed === '') {
                                                            return '<br />';
                                                        }
                                                        
                                                        // Date formatting (usually appears after contact info)
                                                        if (trimmed.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/i)) {
                                                            return `<p style="text-align: right; margin-bottom: 1.5em; margin-top: 1.5em;">${trimmed}</p>`;
                                                        }
                                                        
                                                        // Hiring Manager line
                                                        if (trimmed.match(/^Hiring\s+Manager$/i)) {
                                                            return `<p style="margin-bottom: 0.5em; margin-top: 1.5em;">${trimmed}</p>`;
                                                        }
                                                        
                                                        // Company name line (usually after Hiring Manager)
                                                        if (prevLine.match(/^Hiring\s+Manager$/i)) {
                                                            return `<p style="margin-bottom: 0.5em;">${trimmed}</p>`;
                                                        }
                                                        
                                                        // Salutation
                                                        if (trimmed.match(/^Dear\s+/i)) {
                                                            return `<p style="margin-bottom: 0.5em; margin-top: 1em;">${trimmed}</p>`;
                                                        }
                                                        
                                                        // Contact info lines (first few lines, no special formatting)
                                                        if (idx < 5 && !trimmed.match(/^(Dear|Hiring|January|February|March|April|May|June|July|August|September|October|November|December)/i)) {
                                                            return `<div style="margin-bottom: 0.5em;">${trimmed}</div>`;
                                                        }
                                                        
                                                        // Regular paragraphs
                                                        return `<p style="margin-bottom: 1em; text-align: justify;">${trimmed}</p>`;
                                                    })
                                                    .join(''),
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Fill in the job details on the left and click "Generate Cover Letter" to create your personalized cover letter.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CoverLetterGenerator;
