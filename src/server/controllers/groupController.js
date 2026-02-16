import Group from "../models/Group";


//create group and make creator admin
export const createGroup = async (req, res) => {


}


export const getGroupData = async (req, res) => {

    //make sure to find the correct group by its ID.
    try {
        const { groupID } = req.auth();
        const group = await Group.findById(groupID);
        if (!group) {
            return res.json({
                success: false,
                message: "Group not found"
            });
        }
        res.json({
            success: true,
            group
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
    
}

export const updateGroup = async (req, res) => {
    
}

export const deleteGroup = async (req, res) => {
    
}

export const addGroupMember = async (req, res) => {
    
}

export const removeMember = async (req, res) => {
    
}

export const getMyGroups = async (req, res) => {
    
}
