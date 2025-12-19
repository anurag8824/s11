import React, { useState } from 'react'
import { useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import User from '../../../models/User'
import UserService from '../../../services/user.service'
import { toast } from 'react-toastify'

const UpdateWhatsapp = () => {
  const userState = useAppSelector<{ user: User }>(selectUserData)
  const [whatsappNumber, setWhatsappNumber] = React.useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault() // prevent page reload

    // Optional: Validate WhatsApp number length or format
    if (!whatsappNumber.match(/^\d{10,15}$/)) {
      toast.error('Please enter a valid WhatsApp number')
      return
    }

    const updatedUser = { ...userState.user, whatsapp: whatsappNumber }

    UserService.updateUserWhatsapp(updatedUser)
      .then(() => {
        toast.success('WhatsApp number updated successfully')
      })
      .catch((error) => {
        console.error(error)
        toast.error('Failed to update WhatsApp nu.mber')
      })
  }

  return (
    <div className="container mt-3">
      <form onSubmit={onSubmit} className="d-flex align-items-center gap-2">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="WhatsApp Number"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
        <button type="submit" className="btn btn-sm btn-primary">
          Update
        </button>
      </form>
    </div>
  )
}

export default UpdateWhatsapp
