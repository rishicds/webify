import Image from 'next/image'

const SingleTestimonial = ({ testimonial }: { testimonial: any }) => {
  const { name, avatar, quote, title, year } = testimonial

  return (
    <div className='group flex flex-col gap-8 xl:gap-12 border border-dark_black/10 p-6 2xl:p-10 rounded-2xl dark:bg-white/5'>
      <div className='flex items-center gap-4'>
        <Image
          src={avatar}
          alt={name}
          height={48}
          width={48}
          className='rounded-full object-cover'
        />
        <div>
          <h4 className='font-semibold'>{name}</h4>
          <p className='text-sm text-gray-500'>{title} {year && `· ${year}`}</p>
        </div>
      </div>
      <blockquote className='italic text-lg dark:text-white/80'>
        “{quote}”
      </blockquote>
    </div>
  )
}

export default SingleTestimonial
