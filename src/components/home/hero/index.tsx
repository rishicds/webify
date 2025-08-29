'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import StarRating from '../../shared/star-rating'
import Lottie from 'lottie-react'
import studyAnimation from '@/app/study.json'

function HeroSection() {
  const ref = useRef(null)
   const [avatarList, setAvatarList] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/page-data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()        
        setAvatarList(data)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchData()
  }, [])

  const bottomAnimation = {
    initial: { y: '20%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1, delay: 0.8 },
  }

  return (
    <section>
  <div className='relative w-full pt-44 2xl:pb-20 pb-10 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#fb668c]/20 before:via-white before:to-[#fb668c]/10 before:rounded-full before:top-24 before:blur-3xl before:-z-10 dark:before:from-[#fb668c]/30 dark:before:via-[#fb668c]/20 dark:before:to-[#fb668c]/30 dark:before:rounded-full dark:before:blur-3xl dark:before:-z-10 via-[#fb668c]/10 to-[#fb668c]/5'>
        <div className='container relative z-10'>
          <div ref={ref} className='flex flex-col gap-8'>
            {/* ---------------- heading text --------------- */}
            <motion.div
              {...bottomAnimation}
              className='relative flex flex-col text-center items-center gap-4'>
              <h1 className='font-bold w-full text-4xl md:text-5xl bg-gradient-to-r from-[#fb668c] via-[#fb668c] to-[#fb668c] bg-clip-text text-transparent dark:from-[#fb668c] dark:via-[#fb668c] dark:to-[#fb668c]'>
                Your All-in-One Event + Community Hub
              </h1>
              <p className='max-w-xl text-[#fb668c]/80 dark:text-[#fb668c]/80 text-lg'>
                Discover events, connect with peers, and grow your skills with AI-powered recommendations.
              </p>
            </motion.div>

            <motion.div
              {...bottomAnimation}
              className='flex flex-col items-center justify-center gap-4'>
              <div className='flex flex-col items-center justify-center gap-8 w-full sm:flex-row'>
                {/* ----------- CTA Buttons -------------- */}
                <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center'>
                  <Link
                    href='/login'
                    aria-label='Get Started with Webify'
                    className='flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb668c] to-[#fb668c] text-white font-semibold py-3 px-7 rounded-full shadow-lg border border-[#fb668c] transition-all duration-200 hover:from-[#fb668c]/80 hover:to-[#fb668c]/90 hover:shadow-[#fb668c]/50 focus:outline-none focus:ring-2 focus:ring-[#fb668c] focus:ring-offset-2 w-full sm:w-auto transform hover:scale-105'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M5 12h14M12 5l7 7-7 7' />
                    </svg>
                    Get Started
                  </Link>
                  <Link
                    href='/onboarding?role=organizer'
                    aria-label='Join as Organizer'
                    className='flex items-center justify-center gap-2 bg-white text-[#fb668c] font-semibold py-3 px-7 rounded-full shadow-lg border-2 border-[#fb668c]/30 transition-all duration-200 hover:bg-[#fb668c]/10 hover:border-[#fb668c]/50 hover:text-[#fb668c]/90 focus:outline-none focus:ring-2 focus:ring-[#fb668c] focus:ring-offset-2 w-full sm:w-auto transform hover:scale-105'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Join as Organizer
                  </Link>
                </div>

                {/* --------------- avatar division -------------- */}
                <div className='flex items-center gap-7'>
                  <ul className='avatar flex flex-row items-center'>
                    {avatarList?.avatarList?.map((items:any, index:any) => (
                      <li key={index} className='-mr-2 z-1 avatar-hover:ml-2'>
                        <Image
                          src={items.image}
                          alt='Image'
                          width={44}
                          height={44}
                          quality={100}
                          className='rounded-full border-2 border-white shadow-lg shadow-purple-200/50'
                          unoptimized={true}
                        />
                      </li>
                    ))}
                  </ul>
                  {/* -------------- Star rating division --------------- */}
                  <div className='gap-1 flex flex-col'>
                    <div>
                      <StarRating count={4} color='#9333EA' />
                    </div>
                    <p className='text-sm font-normal text-purple-600/70 dark:text-purple-300/70'>
                      Trusted by 1000+ members
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ----------- Hero Illustration -------------- */}
            

            {/* ----------- Study Lottie Animation -------------- */}
            <div className="hidden md:block">
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: 24,
                  zIndex: 20,
                  pointerEvents: 'none',
                  transform: 'scaleX(-1)',
                }}
              >
                <div className="rounded-full border-4 border-pink-400 bg-pink-100/60 dark:bg-pink-400/10" style={{width: 128, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Lottie
                    animationData={studyAnimation}
                    loop
                    autoplay
                    style={{ width: 100, height: 100 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection