/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums)
{
    let majEle = [nums[0], 0];
    for (let i = 0; i < nums.length; i++)
    {
        if (majEle[1] == 0)
        {
            majEle[0] = nums[i];
            majEle[1]++;
        }
        else
        {
            majEle[1] += (majEle[0] == nums[i]) ? 1 : -1;
        }
    }
    return majEle[0];
};




const nums = [2, 1, 1, 1];
console.log(majorityElement(nums))


