
'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Lottie from 'lottie-react'
import SingleTestimonial from './SingleTestimonial'
import animationData from '../../../app/Digital media 3d.json'

function Achievements() {
  const ref = useRef(null)
  const inView = useInView(ref)
  const [testimonialsList, setTestimonialsList] = useState<any>(null);

  useEffect(() => {
    // Fetch testimonials only. Use the statically imported Lottie JSON
    const fetchData = async () => {
      try {
        const res = await fetch('/api/page-data')
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        setTestimonialsList(data?.testimonialsList)
      } catch (error) {
        console.error('Error fetching testimonials:', error)
      }
    }

    fetchData()
  }, [])

  const bottomAnimation = (index: any) => ({
    initial: { y: '5%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '10%', opacity: 0 },
    transition: { duration: 0.4, delay: 0.4 + index * 0.3 },
  })

  return (
    <section id='testimonials'>
      <div ref={ref} className='2xl:py-20 py-11'>
        <div className='container'>
          <div className='flex flex-col gap-10 md:gap-20'>
            <div className='max-w-3xl text-center mx-auto'>
              <div className='flex items-center justify-center gap-6'>
                <div className='text-left'>
                  <h2 className='text-3xl sm:text-4xl font-headline font-semibold text-dark_black dark:text-white'>
                    Hear from our students
                    <span className='instrument-font italic font-normal dark:text-white/70 block'>
                      — their stories, in their words
                    </span>
                  </h2>
                </div>

                {/* Lottie animation - hidden on very small screens */}
                {animationData && (
                  <div className=' sm:block w-52 h-28'>
                    <Lottie animationData={animationData} loop={true} />
                  </div>
                )}
              </div>
            </div>
            <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {testimonialsList?.map((item:any, index:any) => {
                return (
                  <motion.div {...bottomAnimation(index)} key={index}>
                    <SingleTestimonial key={index} testimonial={item} />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Achievements
