import z from "zod"

export const onboardingSchema = z.object({
    industry : z.string({
       required_error: "Please select an Industry",
    }),
    subIndustry : z.string({
        required_error: "Please select a Sub-Industry",
    }),
    bio : z.string().max(500).optional(),
    experience : z
    .string()
    .transform((val) => parseInt(val,10))
    .pipe(
        z
        .number()
        .min(0,"Experience must be at least 0 years")
        .max(50,"Experience cannot exceed 50 years")
    ),
    skills: z.string().transform((val) =>
        val
            ?val
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
            : undefined
    ),
});

export const contactSchema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    mobile: z.string().min(10, {message: "Mobile number must be at least 10 digits"}).max(10, {message: "Mobile number must be at most 10 digits"}),
    linkedin: z.string().url({message: "Invalid LinkedIn URL"}).optional(),
    twitter: z.string().url({message: "Invalid Twitter URL"}).optional(),
 });

export const entrySchema = z.object({
    title: z.string().min(1, {message: "Title is required"}),
    organization: z.string().min(1, {message: "Organization is required"}),
    startDate: z.string().min(1, {message: "Start date is required"}),
    endDate: z.string().optional(),
    description: z.string().min(1, {message: "Description is required"}),
    current: z.boolean().default(false),
 }).refine((data) => {
    if(!data.current && !data.endDate){
        return false;
    }
    return true;
 }, {
    message: "End date is required if not currently working",
    path: ["endDate"],
 });
 
export const resumeSchema = z.object({
    contact: contactSchema,
    summary: z.string().min(1, {message: "Professional Summary is required"}),
    skills: z.string().min(1, {message: "Skills are required"}),
    experience: z.array(entrySchema),
    education: z.array(entrySchema),    
    projects: z.array(entrySchema),
 });
 