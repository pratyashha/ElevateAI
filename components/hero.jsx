"use client";

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'   
import Image from 'next/image'

export const HeroSection = () => {

const imageRef = useRef(null)

useEffect(() => {
  const imageElement = imageRef.current;

  const handleScroll = ()=>{
  
    const scrollPosition = window.scrollY;
    const scrollThreshold = 100; 

    if (scrollPosition > scrollThreshold){
      imageElement.classList.add("Scrolled");
    } else {
      imageElement.classList.remove("Scrolled");
    }
  };
  window.addEventListener("scroll",handleScroll);
  return () => window.removeEventListener("scroll",handleScroll);
  
}, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className='space-y-6 text-center'>
        <div className='space-y-6 mx-auto '> 
          <h1 className='text-5xl font-bold md:text-6xl lg:text-7xl xl:text-7xl gradient-text'>
            Your AI Career Coach for <br />
            Professional Success
          </h1>
          <p className='mx-auto max-w[600px] md:text-xl text-muted-foreground'>
            Advance your career with personalized AI-driven insights, resume optimization, and interview preparation. Your journey to professional success starts here.
          </p>
        </div>

        <div className='flex justify-center'>
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>


        <div className='hero-imag-wrapper mt-5 md:mt-2 flex justify-center'>
         <div ref={imageRef} className='hero-image'>
          <Image
            src="/banner.jpg"
            alt="Hero Image"
            width={1200}
            height={720}
            className="rounded-lg shadow-lg border mx-auto "
            priority

          />
         </div> 
        </div>
      </div>
    </section>
  )
}
