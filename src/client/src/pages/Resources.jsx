/*******************************************************************************
 * File:        Resources.jsx
 * Description: Static CSUN campus resources page organizing useful links into
 *              categories for quick student reference.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import { ExternalLink } from 'lucide-react'

const categories = [
    {
        title: 'Academic Support',
        color: 'bg-blue-50 border-blue-100',
        headerColor: 'text-blue-700',
        resources: [
            {
                name: 'CSUN Library',
                description: 'Research databases, study rooms, and academic resources',
                url: 'https://library.csun.edu'
            },
            {
                name: 'University Tutoring Services',
                description: 'Free drop-in and appointment tutoring for many subjects',
                url: 'https://www.csun.edu/uts'
            },
            {
                name: 'Writing Center',
                description: 'One-on-one writing consultations for any assignment',
                url: 'https://www.csun.edu/undergraduate-studies/writing-center'
            },
            {
                name: 'Learning Resource Center',
                description: 'Supplemental instruction, workshops, and academic coaching',
                url: 'https://www.csun.edu/lrc'
            },
        ]
    },
    {
        title: 'Student Services',
        color: 'bg-violet-50 border-violet-100',
        headerColor: 'text-violet-700',
        resources: [
            {
                name: 'myNorthridge Portal',
                description: 'Class registration, grades, and student account management',
                url: 'https://mynorthridge.csun.edu'
            },
            {
                name: 'Registrar',
                description: 'Enrollment, transcripts, graduation verification',
                url: 'https://www.csun.edu/registrar'
            },
            {
                name: 'Financial Aid',
                description: 'Scholarships, grants, loans, and FAFSA information',
                url: 'https://www.csun.edu/financialaid'
            },
            {
                name: 'Career Center',
                description: 'Job listings, resume reviews, internships, and career fairs',
                url: 'https://www.csun.edu/career'
            },
        ]
    },
    {
        title: 'Health & Wellness',
        color: 'bg-green-50 border-green-100',
        headerColor: 'text-green-700',
        resources: [
            {
                name: 'Student Health Center',
                description: 'Medical appointments, vaccines, and health services',
                url: 'https://www.csun.edu/shc'
            },
            {
                name: 'Counseling Services',
                description: 'Free mental health counseling and crisis support',
                url: 'https://www.csun.edu/shc/counseling'
            },
            {
                name: 'Disabilities Resources (DRES)',
                description: 'Academic accommodations and disability support services',
                url: 'https://www.csun.edu/dres'
            },
            {
                name: 'Student Recreation Center',
                description: 'Gym, fitness classes, aquatics, and intramural sports',
                url: 'https://www.csun.edu/src'
            },
        ]
    },
    {
        title: 'Campus Life',
        color: 'bg-orange-50 border-orange-100',
        headerColor: 'text-orange-700',
        resources: [
            {
                name: 'Food Pantry (SCENE)',
                description: 'Free food and basic needs support for CSUN students',
                url: 'https://www.csun.edu/scene'
            },
            {
                name: 'Associated Students',
                description: 'Student government, clubs, campus events and programs',
                url: 'https://www.csun.edu/as'
            },
            {
                name: 'Housing & Residential Life',
                description: 'On-campus housing, resident advisors, and community living',
                url: 'https://www.csun.edu/housing'
            },
            {
                name: 'Oasis Wellness Center',
                description: 'Relaxation programs, stress management workshops, and more',
                url: 'https://www.csun.edu/shc/oasis'
            },
        ]
    },
    {
        title: 'Technology & IT',
        color: 'bg-slate-50 border-slate-200',
        headerColor: 'text-slate-700',
        resources: [
            {
                name: 'IT Help Desk',
                description: 'Technical support for CSUN accounts, software, and devices',
                url: 'https://www.csun.edu/it'
            },
            {
                name: 'Canvas (Learning Management)',
                description: 'Course materials, assignments, and instructor communication',
                url: 'https://canvas.csun.edu'
            },
            {
                name: 'Microsoft 365 for Students',
                description: 'Free Office apps, OneDrive storage via your CSUN account',
                url: 'https://www.csun.edu/it/microsoft-office-365'
            },
            {
                name: 'Virtual Desktop (Horizon)',
                description: 'Access campus software remotely from any device',
                url: 'https://www.csun.edu/it/virtual-desktop'
            },
        ]
    },
]

/*******************************************************************************
 * Function:    Resources
 * Description: Renders a categorized grid of CSUN campus resource links. Each
 *              card opens the resource in a new tab.
 * Input:       None
 * Output:      Rendered static resource listing page
 * Return:      JSX.Element
 ******************************************************************************/
const Resources = () => {
    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-5xl mx-auto p-6'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900'>Campus Resources</h1>
                    <p className='text-slate-500 mt-1'>Quick links to CSUN student services and support</p>
                </div>

                <div className='flex flex-col gap-8'>
                    {categories.map((category) => (
                        <div key={category.title}>
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${category.headerColor}`}>
                                {category.title}
                            </h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {category.resources.map((resource) => (
                                    <a
                                        key={resource.name}
                                        href={resource.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={`flex items-start justify-between gap-3 p-4 rounded-2xl border ${category.color} hover:shadow-md transition group`}
                                    >
                                        <div>
                                            <p className='font-semibold text-slate-800 group-hover:text-primary-600 transition text-sm'>
                                                {resource.name}
                                            </p>
                                            <p className='text-xs text-slate-500 mt-0.5 leading-relaxed'>
                                                {resource.description}
                                            </p>
                                        </div>
                                        <ExternalLink className='w-4 h-4 text-slate-300 group-hover:text-primary-400 transition flex-shrink-0 mt-0.5'/>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <p className='text-xs text-slate-400 text-center mt-10'>
                    All links open the official CSUN website. Contact{' '}
                    <a href='https://www.csun.edu' target='_blank' rel='noopener noreferrer' className='underline hover:text-slate-600'>
                        csun.edu
                    </a>{' '}
                    for the most up-to-date information.
                </p>
            </div>
        </div>
    )
}

export default Resources
