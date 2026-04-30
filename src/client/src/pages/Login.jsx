/*******************************************************************************
 * File:        Login.jsx
 * Description: Authentication landing page showing the app logo, tagline, and
 *              Clerk sign-in/sign-up buttons.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import { assets } from '../assets/assets'
import { SignIn } from '@clerk/clerk-react'
import { BookOpen, Users, Calendar } from 'lucide-react'

/*******************************************************************************
 * Function:    Login
 * Description: Renders the unauthenticated landing page with the app logo,
 *              tagline, and Clerk SignIn/SignUp buttons.
 * Input:       None
 * Output:      Rendered login/signup landing page
 * Return:      JSX.Element
 ******************************************************************************/
const Login = () => {
    return (
        <div className='min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary-50 via-white to-rose-50'>

            {/* Decorative blobs */}
            <div className='pointer-events-none absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-primary-200/40 blur-3xl' />
            <div className='pointer-events-none absolute bottom-[-60px] left-[30%] w-96 h-96 rounded-full bg-rose-200/30 blur-3xl' />
            <div className='pointer-events-none absolute top-[20%] right-[-60px] w-72 h-72 rounded-full bg-primary-300/20 blur-3xl' />

            {/* Left side — Branding */}
            <div className='flex-1 flex flex-col justify-between p-10 md:p-14 lg:pl-24 xl:pl-36 relative'>

                <img src={assets.logo} alt="Study Buddy" className='h-16 md:h-20 object-contain self-start' />

                <div className='max-w-lg'>
                    <h1 className='text-5xl md:text-7xl font-extrabold leading-tight mb-5 text-gray-900'>
                        Study smarter,{' '}
                        <span className='bg-gradient-to-r from-primary-500 to-rose-500 bg-clip-text text-transparent'>
                            together.
                        </span>
                    </h1>
                    <p className='text-gray-500 text-lg md:text-xl mb-10 max-w-md'>
                        Find study partners, join groups, and stay on top of your coursework — all in one place.
                    </p>

                    <div className='flex flex-col gap-4'>
                        {[
                            { icon: Users,    text: 'Connect with students in your classes' },
                            { icon: BookOpen, text: 'Join or create study groups by subject' },
                            { icon: Calendar, text: 'Schedule and track study sessions' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className='flex items-center gap-4'>
                                <div className='w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm'>
                                    <Icon className='w-5 h-5 text-primary-600' />
                                </div>
                                <span className='text-gray-600 text-sm md:text-base font-medium'>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className='text-gray-300 text-xs'>© 2025 Study Buddy</p>
            </div>

            {/* Right side — Clerk SignIn */}
            <div className='flex-1 flex items-center justify-center p-6 sm:p-10 relative'>
                <div className='w-full max-w-md'>
                    <SignIn />
                </div>
            </div>
        </div>
    )
}

export default Login
