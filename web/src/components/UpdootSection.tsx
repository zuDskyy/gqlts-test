import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql'

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">("not-loading");
    const [, vote] = useVoteMutation();

    console.log(post.voteStatus)
    return (
        <Flex direction="column"
            justifyContent="center"
            alignItems="center"
            mr={4}>
            <IconButton onClick={async () => {
                if(post.voteStatus === 1){
                    return;
                }
                setLoadingState("updoot-loading")
                await vote({
                    postId: post.id,
                    value: 1,
                })
                setLoadingState("not-loading")
            }}
                bgColor={post.voteStatus === 1 ? "green" : undefined}
                isLoading={loadingState === "updoot-loading"}
                aria-label="ChevronUpIcon" 
                as={ChevronUpIcon} />
            {post.points}
            <IconButton onClick={() => {
                if(post.voteStatus === -1){
                    return;
                }
                setLoadingState("downdoot-loading")
                vote({
                    postId: post.id,
                    value: -1
                })
                setLoadingState("not-loading")
            }}   
                bgColor={post.voteStatus === -1? "red" : undefined}
                isLoading={loadingState === "downdoot-loading"}
                aria-label="ChevronDownIcon"
                as={ChevronDownIcon} />
        </Flex>
    )


}
