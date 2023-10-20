import React from 'react'
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { Button ,Box} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { InputFied } from '../../../components/InputFied';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useRouter } from 'next/router';


const EditPost = ({  }) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{data,fetching}] = usePostQuery({
        pause:intId === -1,
        variables:{
            id:intId
        }
    });
    const [,updatePost] = useUpdatePostMutation();
    

  if(fetching) {
    return(
        <Layout>
            <div>loading...</div>
        </Layout>
    )  }

    if(!data?.post){
        return( 
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        )
    }
  return (
    <Layout variant='small'>
    <Formik
      initialValues={{ text: data.post.text, title:data.post.title }}
      onSubmit={async (values) => {
     
       await updatePost ({id: intId, ...values as any});
       router.back();
      }
      }
    >
      {({ isSubmitting }) => (
        <Form>
          <InputFied
            name="title"
            placeholder='title'
            label="Title"
          />
          <Box mt={4}>
            <InputFied
              textarea
              name="text"
              placeholder='text'
              label="Body"

            />
          </Box>

          <Button mt={4} type="submit" isLoading={isSubmitting} color="teal">Update Post</Button>
        </Form>
      )}
    </Formik>

  </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(EditPost);