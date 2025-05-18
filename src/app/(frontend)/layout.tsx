import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Content from the world, curated for me',
  title: 'Digest',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
