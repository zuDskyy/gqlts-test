import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import {useRouter} from "next/router";
interface NavbarProps {

}

export const Navbar: React.FC<NavbarProps> = ({ }) => {
    const router = useRouter();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer()
    });
    let body = null




    if (fetching) {

    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link color="white" mr={2}>login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color="white"> register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button as={Link} mr={2}>
                        create post
                    </Button>
                </NextLink>
                <Box mr={2}>
                    {data.me.username}
                </Box>
                <Button
                    onClick={async () => {
                        // @ts-ignore
                        await logout()
                        router.reload();
                    }}
                    isLoading={logoutFetching}
                    variant="link"
                >
                    logout
                </Button>
            </Flex>
        )
    }








    return (
        <Flex zIndex={1} position="sticky" top={0} borderBottom={"2px"}  backdropFilter={"blur(2px)"} borderBottomColor={"white"} p={4} align="center" >
            <NextLink href="/">
                <Link>
                    <Heading>
                        ZuDskyy
                    </Heading>
                </Link>
            </NextLink>
            <Box ml={"auto"}>
                {body}
            </Box>
        </Flex>
    )
}