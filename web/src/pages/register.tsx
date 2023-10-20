import React, { FC } from 'react'
import { Form, Formik } from "formik";
import {
  Box,
  Button
} from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputFied } from '../components/InputFied';

import { useRegisterMutation } from '../generated/graphql';
import { toErrorMaps } from '../utils/toErrorMaps';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

interface registerProps { }

// const REG_MUT = `
// mutation Register($username: String!, $password:String! ){
//   register(options : {username:$username , password:$password}){
//     errors{
//       field
//       message
//     }
//     user{
//       id
//       username
//     }
//   }
// }
// `

const register: FC<registerProps> = ({ }) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email:"", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {

          const response = await register({options:values})

          if (response.data?.register.errors) {
            setErrors(toErrorMaps(response.data.register.errors))
          }else if(response.data?.register.user){
         
               router.push("/");
          }



        }
        }
      >
        {({ isSubmitting }) => (
          <Form>
            <InputFied
              name="username"
              placeholder='username'
              label="User Name"
            />
             <Box mt={4}>
              <InputFied
                name="email"
                placeholder='email'
                label="Email"
                type="email"
              />
            </Box>
            <Box mt={4}>
              <InputFied
                name="password"
                placeholder='password'
                label="Password"
                type="password"
              />
            </Box>
            <Button mt={4} type="submit" isLoading={isSubmitting} color="teal">register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default  withUrqlClient(createUrqlClient)(register);

