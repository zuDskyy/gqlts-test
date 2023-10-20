import React, { FC } from 'react'
import { Form, Formik } from "formik";
import {
  Box,
  Button,
  Flex,
  Link
} from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputFied } from '../components/InputFied';
import NextLink from "next/link"
import { useLoginMutation } from '../generated/graphql';
import { toErrorMaps } from '../utils/toErrorMaps';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface loginProps { }

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


const login: FC<loginProps> = ({ }) => {
  const router = useRouter();

  const [, login] = useLoginMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {

          const response = await login(values)

          if (response.data?.login.errors) {
            setErrors(toErrorMaps(response.data.login.errors))
          } else if (response.data?.login.user) {
            if(typeof router.query.next === "string"){
              router.push(router.query.next);
            }else{

              router.push("/");
            }
          }
        }
        }
      >
        {({ isSubmitting }) => (
          <Form>
            <InputFied
              name="usernameOrEmail"
              placeholder='username or email'
              label="Username Or Email"
            />
            <Box mt={4}>
              <InputFied
                name="password"
                placeholder='password'
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link>forget password?</Link>
              </NextLink>
            </Flex>
            <Button mt={4} type="submit" isLoading={isSubmitting} color="teal">Login</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(login);

