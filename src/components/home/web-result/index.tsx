'use client'
import Image from 'next/image'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'

function WebResult() {
  const [data, setData] = useState<any>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/page-data')
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        setData(data?.WebResultTagList)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <section id='aboutus'>
      <div className='2xl:py-20 py-11  from-white via-purple-50/40 to-lavender-50/60 dark:bg-gradient-to-br dark:from-purple-950/20 dark:via-purple-900/10 dark:to-purple-800/20'>
        <div className='container'>
          <div className='flex flex-col lg:gap-16 gap-5'>
            <div className='flex flex-col items-center justify-center text-center gap-3'>
              <h2 className='max-w-6xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-300 dark:via-lavender-200 dark:to-purple-400'>
                Building vibrant communities through meaningful connections, 
                collaborative learning, and engaging experiences powered by
              </h2>
              <div>
                <h2>
                  {data?.map((items:any, index:any) => (
                    <span
                      key={index}
                      className={`inline-flex m-2 py-2 px-6 gap-3 rounded-full bg-gradient-to-r from-purple-100 to-lavender-100 border border-purple-200 text-purple-700 items-center shadow-lg shadow-purple-200/50 hover:shadow-purple-300/60 transition-all duration-300 hover:scale-105 dark:from-purple-800/50 dark:to-purple-700/50 dark:border-purple-600/50 dark:text-purple-200`}>
                      <Image
                        src={items.image}
                        alt={items.name}
                        width={40}
                        height={40}
                        style={{ width: 'auto', height: 'auto' }}
                        className='rounded-full'
                      />
                      <span className='instrument-font italic font-medium'>
                        {items.name}
                      </span>
                    </span>
                  ))}
                </h2>
              </div>
            </div>
            <div className='flex-col md:flex md:flex-row justify-center items-center text-center'>
              <div className='relative 2xl:px-24 px-16 md:py-8 py-4'>
                <h2 ref={ref} className='2xl:text-9xl md:text-7xl text-5xl bg-gradient-to-b from-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-500'>
                  <sup className='text-purple-500 dark:text-purple-400'>+</sup>
                  {inView ? <CountUp start={0} end={5000} duration={3} /> : '0'}
                </h2>
                <p className='mt-2 text-purple-600/80 dark:text-purple-300/80 font-medium'>
                  Community Members
                </p>
                <div className='hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-28 w-px bg-gradient-to-b from-transparent via-purple-300/60 to-transparent dark:via-purple-600/60' />
              </div>
              <div className='relative 2xl:px-24 px-16 md:py-8 py-4'>
                <h2 className='2xl:text-9xl md:text-7xl text-5xl bg-gradient-to-b from-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-500'>
                  <sup className='text-purple-500 dark:text-purple-400'>+</sup>
                  {inView ? <CountUp start={0} end={1200} duration={3} /> : '0'}
                </h2>
                <p className='mt-2 text-purple-600/80 dark:text-purple-300/80 font-medium'>
                  Events Hosted
                </p>
                <div className='hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-28 w-px bg-gradient-to-b from-transparent via-purple-300/60 to-transparent dark:via-purple-600/60' />
              </div>
              <div className='relative 2xl:px-24 px-16 md:py-8 py-4'>
                <h2 className='2xl:text-9xl md:text-7xl text-5xl bg-gradient-to-b from-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-300 dark:to-purple-500'>
                  <sup className='text-purple-500 dark:text-purple-400'>+</sup>
                  {inView ? <CountUp start={0} end={98} duration={3} /> : '0'}
                </h2>
                <p className='mt-2 text-purple-600/80 dark:text-purple-300/80 font-medium'>
                  Satisfaction Rate %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WebResult