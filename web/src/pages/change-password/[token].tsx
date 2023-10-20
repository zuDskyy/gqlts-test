import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { InputFied } from '../../components/InputFied';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMaps } from '../../utils/toErrorMaps';
import { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

import NextLink from "next/link";


const ChangePassword: NextPage = ({}) => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {

                    const response = await changePassword({
                         newPassword: values.newPassword, 
                         token : typeof router.query.token === "string" ? router.query.token : "",
                        })

                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMaps(response.data.changePassword.errors)
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token);
                        }
                        setErrors(errorMap)

                    } else if (response.data?.changePassword.user) {
                        router.push("/");
                    }
                }
                }
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputFied
                            name="newPassword"
                            placeholder='new password '
                            label="NewPassword"
                        />
                        {tokenError ?
                         <Box color="red">
                            <Box>{tokenError}</Box>
                            <NextLink href="/forgot-password">
                                <Link>go forget it again</Link>
                            </NextLink>
                        </Box> 
                        : null}
                        <Button mt={4} type="submit" isLoading={isSubmitting} color="teal">change password</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}




export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword)