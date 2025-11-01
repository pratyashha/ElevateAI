"use client";

import { HeroSection }  from "@/components/hero";
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { faqs } from "@/data/faqs";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { testimonial } from "@/data/testimonials";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GetStartedButton } from "@/components/get-started-button";
import { ArrowRight } from "lucide-react";
import { AvatarInitials } from "@/components/ui/avatar-initials";


export default function Home() {
  return (
    <div>
      <div className="grid-background"></div>
      
      <HeroSection />

{/* __________________Features Section________________ */}

      <section className="w-full py-12 md:py-24  bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
           <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tighter mb-12">
            Powerful Features for Your Career Growth</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {features.map((feature,index)=>{
              return (<Card key={index} className="border-2 hover:border-primary transition-colors duration-300">   
                <CardContent className="pt-6 text-center flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center justify-center ">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {feature.title} 
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
                
              </Card>
              );
            })}
            </div>
          </div>
        </div>
      </section>

{/* __________________Statistics Section________________ */}

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
           <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h3 className="text-4xl font-bold">50+</h3>
            <p className="text-xl bg-muted">Industries Covered</p>
           </div>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h3 className="text-4xl font-bold">1000+</h3>
            <p className="text-xl bg-muted">Interview Questions</p>
           </div>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h3 className="text-4xl font-bold">95%</h3>
            <p className="text-xl bg-muted">Success Rate</p>
           </div>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h3 className="text-4xl font-bold">24/7</h3>
            <p className="text-xl bg-muted">AI Support</p>
           </div>
            </div>
          </div>
        </div>
      </section>

{/* __________________How It Works Section________________ */}

      <section className="w-full py-12 md:py-24  bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
           <div className="mb-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tighter mb-8">
            How It Works</h2>
            <p className="text-center text-muted-foreground ">
              Four Simple Steps to Boost Your Career
            </p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            { howItWorks.map((item,index)=>{
              return (
               <div key={index} className="flex flex-col items-center text-center space-y-4 px-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto ">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
               </div>
              );
            })}
            </div>
          </div>
        </div>
      </section>

{/* __________________Testimonial Section________________ */}

      <section className="w-full py-12 md:py-24  bg-muted/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
           <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tighter mb-12">
           What Our Users Say</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8 md:gap-8 max-w-6xl mx-auto">
            {testimonial.map((testimonial,index)=>{
              return (<Card key={index} className="bg-background">   
                <CardContent className="pt-6 ">
                  <div className="flex flex-col  space-y-4">
                    <div className="flex items-center space-x-4 mb-2">
                        <div className="relative shrink-0">
                          <AvatarInitials name={testimonial.author} size={48} />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-sm text-primary">{testimonial.company}</p>
                      </div>
                    </div>
                    <blockquote>
                      <p className="relative text-muted-foreground italic">
                        <span className="absolute -left-2 -top-4 text-3xl text-primary/90 ">
                          &quot;
                        </span>
                        {testimonial.quote}
                        <span className="absolute text-3xl text-primary/90 ">
                          &quot;
                        </span>
                      </p>

                    </blockquote>

                  </div>
                </CardContent>
                
              </Card>
              );
            })}
            </div>
          </div>
        </div>
      </section>

{/* __________________FAQ Section________________ */}

      <section className="w-full py-12 md:py-24  bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
           <div className="mb-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tighter mb-8">
            Frequently Asked Questions</h2>
            <p className="text-center text-muted-foreground ">
              Find answers to common questions about our AI career coaching services.
            </p>
           </div>
           <div className="max-w-6xl mx-auto ">
            <Accordion type="single" collapsible className="w-full">
              { faqs.map((faq,index)=>{
              return (
                <AccordionItem key={index} value={`item-${index}`} className="border-b">
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              );
             })}
            </Accordion>

            </div>
          </div>
        </div>
      </section>

{/* __________________Call to Action Section________________ */}

      <section className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mx-auto py-24 gradient rounded-lg">
           <div className="flex flex-col items-center justify-center space-y-4 mb-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-center tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
            Ready to Accelerate Your Career?</h2>
            <p className="mx-auto max-w-[600px] text-center text-primary-foreground/80 md:text-xl">
              Join thousands of professionals who have transformed their careers with AI-powered guidance.
            </p>
            <GetStartedButton size="lg" variant="secondary" className="h-11 mt-5 animate-bounce">
              Start Your Journey Today <ArrowRight className="ml-2 h-4 w-4"/>
            </GetStartedButton>
           </div>
           
            </div>
          </div>
        </div>
      </section>



    </div>
  );
}
