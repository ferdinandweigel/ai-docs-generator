import nextra from 'nextra'
 
// Set up Nextra with its configuration
const withNextra = nextra({
  search: { codeblocks: false }
})
 
// Export the final Next.js config with Nextra included
export default withNextra({
  experimental: {
    viewTransition: true,
   /* staleTimes: {
      dynamic: 300, // 5 minutes for dynamic pages
      static: 600, // 10 minutes for static pages
    }, */
  },
})