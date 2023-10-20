import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { EditDeletePostButton } from "../components/EditDeletePostButton";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";


const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string
  });
 
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });


  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {

    setIsMounted(true);


  }, [])


  if (!isMounted) {
    return null
  }

  if (!fetching && !data) {
    return (<div>you got query failed for   some reason </div>)
  }

  return (
    <Layout>
      {!data && fetching ?
        (<div>loading... </div>) : (
          <Stack spacing={8}>
            {data?.posts.posts.map((post) => !post ? null : (
              <Flex key={post.id} p={5} shadow='md' borderWidth='1px' >
                <UpdootSection post={post} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize='xl'>{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {post.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>{post.textSnippet}</Text>
                    
                     <Box ml={"auto"}>
                       <EditDeletePostButton id={post.id} creatorId={post.creator.id} />
                      </Box>
                      </Flex>
                </Box>
              </Flex>
            ))}
          </Stack>)}
      {data && data.posts.hasMore ? (<Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
          })
        }} isLoading={fetching} m="auto" my={8}>load more</Button>
      </Flex>) : null}

    </Layout>
  )

}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
