This is a repository containg a system of automate information generation trough various tools.
Current information flow is below:
 Slack app -> Notion page -> Github Readme

This system is intended to have following structure:
1. Trace Slack messages from particular channel by triggering event anytime new message with specified tag is posted, like #todo, #news, etc. - use of Slack API.
2. Get specified tag based messages and post then into specific Notion Pages - use of Notion API.
3. Trace Notion pages updates and trigger new Readme generation in specified Github repository - use of git commitinstruction through bash scripts. 

INSTALLATION

DEPENDENCIES

USAGE
Replace configs from below file and run configuration environment variables:
    $ source configs/selab_sela_configs.env
