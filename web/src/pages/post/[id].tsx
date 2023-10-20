import { withUrqlClient } from 'next-urql'
import React from 'react'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { Layout } from '../../components/Layout'
import { Box, Heading } from '@chakra-ui/react'
import { useGetPostFormUrl } from '../../utils/useGetPostFormUrl'
import { EditDeletePostButton } from '../../components/EditDeletePostButton'


const Post = ({ }) => {


  const [{ data, fetching }] = useGetPostFormUrl()

   
   if(fetching){
    return (
      <Layout variant='small'>
        <div>loading...</div>
      </Layout>
    )
   }


    if(!data?.post){
      return <Layout variant='small'>
         <Box>
            could not find post
         </Box>
      </Layout>
    }

  return (
     <Layout  variant="small">
      <Heading>
        {data.post.title}
      </Heading>
      <Box mb={4}>
      {data.post.text}
      </Box>
      <EditDeletePostButton  id={data.post.id} creatorId={data.post.creator.id}/>
     </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)