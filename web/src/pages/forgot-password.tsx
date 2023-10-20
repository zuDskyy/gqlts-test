import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InputFied } from '../components/InputFied'
import { Wrapper } from '../components/Wrapper'
import { toErrorMaps } from '../utils/toErrorMaps'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { useForgotPasswordMutation } from '../generated/graphql'



const ForgotPassword: React.FC<{}> = ({ }) => {
  const [complete, setComplete] = useState(false);
  const router = useRouter();
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, { setErrors }) => {

          await forgotPassword(values);
          setComplete(true)

          // if (response.data?.login.errors) {
          //   setErrors(toErrorMaps(response.data.login.errors))
          // } else if (response.data?.login.user) {
          // //   router.push("/");
          // }
        }
        }
      >
        {({ isSubmitting }) => complete ? <Box>if an account with this email exists ,we sent you can email</Box> : (
          <Form>
            <InputFied
              name="email"
              placeholder='email'
              label="Email"
            />


            <Button mt={4} type="submit" isLoading={isSubmitting} color="teal">Forgot Password</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);