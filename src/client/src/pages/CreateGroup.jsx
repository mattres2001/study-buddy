import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { PenBox } from 'lucide-react'
import CreateGroupModal from '../components/CreateGroupModal'
import Loading from '../components/Loading'

const CreateGroup = () => {
    
    // Get current user's userId
    const { userId } = useAuth()

    // Loading state
    const [ loading, setLoading ] = useState(false)
    
    // Create group modal state
    const [ showModal, setShowModal ] = useState(false)

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
            <div className='max-w-6xl mx-auto p-6'>
                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Start a Study Group!</h1>
                </div>

                <button onClick={() => setShowModal(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer'>
                    <PenBox className='w-4 h-4'/>
                    Edit
                </button>

            </div>
            {showModal && <CreateGroupModal setShowModal={setShowModal}/>}
        </div>
    )
}

export default CreateGroup
